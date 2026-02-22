import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createOrderWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

function log(msg: string) {
    console.log(`[ORDERS-v6] ${msg}`)
}

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { customer_id, customer_email, items, metadata } = (req.body || {}) as any
        log(`POST request for CID=${customer_id} Email=${customer_email}`);

        if (!items || !Array.isArray(items)) {
            throw new Error("Missing items array in request body");
        }

        const query = req.scope.resolve("query")

        // --- Resolve real Medusa customer ID ---
        let resolvedCustomerId = customer_id?.startsWith('cus_') ? customer_id : undefined;
        let resolvedEmail = customer_email;

        if (!resolvedCustomerId && customer_email) {
            const { data: customers } = await query.graph({
                entity: "customer",
                fields: ["id", "email"],
                filters: { email: customer_email }
            });
            if (customers && customers.length > 0) {
                resolvedCustomerId = customers[0].id;
                resolvedEmail = customers[0].email;
                log(`Resolved to real ID: ${resolvedCustomerId}`);
            }
        }

        const { data: regions } = await query.graph({
            entity: "region",
            fields: ["id", "currency_code"]
        })

        if (!regions || regions.length === 0) {
            throw new Error("No regions found in Medusa. Cannot create order.");
        }

        // Sales Channel resolution
        let salesChannelId: string | undefined;
        const scResult = await query.graph({
            entity: "sales_channel",
            fields: ["id"],
            filters: { name: "Default Sales Channel" }
        });
        if (scResult.data && scResult.data.length > 0) {
            salesChannelId = scResult.data[0].id;
        } else {
            const allSc = await query.graph({ entity: "sales_channel", fields: ["id"] });
            salesChannelId = allSc.data?.[0]?.id;
        }

        if (!salesChannelId) {
            throw new Error("No sales channel found. Cannot create order.");
        }

        const { data: shippingOptions } = await query.graph({
            entity: "shipping_option",
            fields: ["id", "name"]
        })

        const shipping_methods = (shippingOptions && shippingOptions.length > 0) ? [{
            option_id: shippingOptions[0].id,
            amount: 0,
            name: shippingOptions[0].name
        }] : []

        log(`Running workflow with CID=${resolvedCustomerId} Email=${resolvedEmail}`);

        const { result: order } = await createOrderWorkflow(req.scope).run({
            input: {
                region_id: regions[0]?.id,
                sales_channel_id: salesChannelId,
                customer_id: resolvedCustomerId,
                email: resolvedEmail || 'guest@aicasthub.com',
                currency_code: regions[0]?.currency_code || "eur",
                shipping_methods,
                items: items.map((i: any) => ({
                    title: i.title,
                    unit_price: i.unit_price,
                    quantity: i.quantity,
                    thumbnail: i.thumbnail
                })),
                metadata: {
                    ...metadata,
                    buyer_id: resolvedCustomerId || customer_id || 'guest',
                }
            }
        })

        // Force Medusa order to show as "Paid"
        try {
            const orderModuleService = req.scope.resolve(Modules.ORDER) as any;
            await orderModuleService.updateOrders(order.id, {
                payment_status: "captured"
            });
        } catch (e: any) {
            log(`Failed to mark order as paid: ${e.message}`);
        }

        log(`SUCCESS: ${order.id}`);
        res.json({ order })
    } catch (err: any) {
        log(`POST ERROR: ${err.message}`);
        console.error("Order creation error:", err)
        res.status(500).json({ message: err.message })
    }
}


export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        log(`GET request query=${JSON.stringify(req.query || {})}`);
        const query = req.scope.resolve("query")
        const customerId = req.query?.customer_id as string
        const sellerIdParam = req.query?.seller_id as string
        const sellerEmail = req.query?.seller_email as string
        const customerEmail = req.query?.customer_email as string

        if (customerId || customerEmail) {
            log(`Fetching for CID=${customerId}, Email=${customerEmail}`);

            const allOrdersMap = new Map();

            // 1. Fetch by customerId (if provided)
            if (customerId && customerId !== 'undefined' && customerId !== 'guest') {
                const result = await query.graph({
                    entity: "order",
                    fields: ["id", "status", "total", "created_at", "metadata", "customer_id", "items.*"],
                    filters: { customer_id: customerId }
                });
                if (result.data && Array.isArray(result.data)) {
                    result.data.forEach((o: any) => allOrdersMap.set(o.id, o));
                }
            }

            // 2. Fetch by email (if provided)
            if (customerEmail && customerEmail !== 'undefined') {
                const result = await query.graph({
                    entity: "order",
                    fields: ["id", "status", "total", "created_at", "metadata", "customer_id", "items.*"],
                    filters: { email: customerEmail }
                });
                if (result.data && Array.isArray(result.data)) {
                    result.data.forEach((o: any) => allOrdersMap.set(o.id, o));
                }

                // Also try fetching by real customer ID resolved from email
                const cResult = await query.graph({
                    entity: "customer",
                    fields: ["id"],
                    filters: { email: customerEmail }
                });
                if (cResult.data && Array.isArray(cResult.data) && cResult.data.length > 0) {
                    const realId = cResult.data[0].id;
                    if (realId !== customerId) {
                        const rResult = await query.graph({
                            entity: "order",
                            fields: ["id", "status", "total", "created_at", "metadata", "customer_id", "items.*"],
                            filters: { customer_id: realId }
                        });
                        if (rResult.data && Array.isArray(rResult.data)) {
                            rResult.data.forEach((o: any) => allOrdersMap.set(o.id, o));
                        }
                    }
                }
            }

            const mergedOrders = Array.from(allOrdersMap.values())
                .sort((a, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Lazily sync old orders to show clean UI in Admin panel
            try {
                const orderModuleService = req.scope.resolve(Modules.ORDER) as any;
                for (const o of mergedOrders) {
                    const isReleased = o.metadata?.escrow_status === 'released' || o.status === 'completed';
                    const needsUpdate =
                        (o.payment_status !== 'captured') ||
                        (isReleased && o.fulfillment_status !== 'fulfilled');

                    if (needsUpdate) {
                        try {
                            const updatePayload: any = { payment_status: "captured" };
                            if (isReleased) {
                                updatePayload.fulfillment_status = "fulfilled";
                                updatePayload.status = "completed";
                            }
                            await orderModuleService.updateOrders(o.id, updatePayload);

                            // Patch in-memory object so UI responds perfectly immediately
                            o.payment_status = "captured";
                            if (isReleased) {
                                o.fulfillment_status = "fulfilled";
                                o.status = "completed";
                            }
                        } catch (err: any) {
                            log(`Silent background update fail for ${o.id}: ${err.message}`);
                        }
                    }
                }
            } catch (e: any) {
                log(`Failed background order UI fix: ${e.message}`);
            }

            return res.json({ orders: mergedOrders });
        }

        if (sellerIdParam || sellerEmail) {
            log(`Seller query: ID=${sellerIdParam} Email=${sellerEmail}`);
            const possibleIds = new Set<string>()
            if (sellerIdParam && sellerIdParam !== 'undefined') possibleIds.add(sellerIdParam)
            possibleIds.add('seller-1')

            if (sellerEmail && sellerEmail !== 'undefined') {
                const result = await query.graph({
                    entity: "customer",
                    fields: ["id"],
                    filters: { email: sellerEmail }
                })
                if (result.data && result.data.length > 0) possibleIds.add(result.data[0].id)
            }

            const { data: allOrders } = await query.graph({
                entity: "order",
                fields: ["id", "status", "total", "created_at", "metadata", "customer_id", "items.*"],
            })

            const sellerOrders = Array.isArray(allOrders)
                ? allOrders.filter((o: any) => possibleIds.has(o.metadata?.seller_id))
                : [];

            log(`Seller query found ${sellerOrders.length} orders`);
            return res.json({ orders: sellerOrders })
        }

        res.json({ orders: [] })
    } catch (err: any) {
        log(`GET ERROR: ${err.message}`);
        console.error("GET Orders Error:", err)
        res.status(500).json({ message: err.message })
    }
}
