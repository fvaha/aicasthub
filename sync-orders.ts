import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const query = container.resolve("query");
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const remoteLink = container.resolve("remoteLink");

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "currency_code", "total", "payment_collections.*", "fulfillments.*"],
    });

    console.log(`Found ${orders.length} orders to check.`);

    for (const o of orders) {
        let touched = false;
        const amount = o.total || 0;

        if (!o.payment_collections || o.payment_collections.length === 0) {
            console.log(`Creating payment for ${o.id} amount ${amount}`);
            const pc = await paymentModuleService.createPaymentCollections({
                currency_code: o.currency_code || "eur",
                amount: amount,
                status: "authorized"
            });
            // create a payment inside it to make it captured
            const session = await paymentModuleService.createPaymentSessions(pc.id, {
                provider_id: "pp_system_default",
                currency_code: o.currency_code || "eur",
                amount: amount,
                data: {}
            });
            const payment = await paymentModuleService.createPayments({
                payment_collection_id: pc.id,
                payment_session_id: session.id,
                currency_code: o.currency_code || "eur",
                amount: amount,
                provider_id: "pp_system_default",
            });
            await paymentModuleService.capturePayment({
                payment_id: payment.id,
                amount: amount,
            });

            await remoteLink.create({
                [Modules.ORDER]: { order_id: o.id },
                [Modules.PAYMENT]: { payment_collection_id: pc.id }
            });
            touched = true;
        }

        if (!o.fulfillments || o.fulfillments.length === 0) {
            console.log(`Creating fulfillment for ${o.id}`);
            // In v2, fulfillment requires location_id, provider_id, etc. If it fails, we will skip it and maybe just leave it unfulfilled or try to make a basic one.
            try {
                const ful = await fulfillmentModuleService.createFulfillment({
                    location_id: "loc_dummy",
                    provider_id: "manual",
                    delivery_address: {},
                    items: [],
                    order: {} as any
                });
                await remoteLink.create({
                    [Modules.ORDER]: { order_id: o.id },
                    [Modules.FULFILLMENT]: { fulfillment_id: ful.id }
                });
                touched = true;
            } catch (err: any) {
                console.log("Fulfillment skip: ", err.message);
            }
        }
    }
}
