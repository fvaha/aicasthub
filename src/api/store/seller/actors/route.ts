import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { Modules, ProductStatus } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve("query")
    const sellerId = req.query.seller_id as string // In real app, get from authenticated user

    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "status", "thumbnail", "metadata"],
        filters: {
            metadata: {
                seller_id: sellerId
            }
        } as any
    })

    res.json({ products })
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    console.log("[ACTOR_CREATE] POST reached with body:", JSON.stringify(req.body));
    const { title, description, price, image_url, category_id, seller_id } = req.body as any

    // 1. Get Default Sales Channel
    const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL)
    const [salesChannel] = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    })

    // 2. Create Product
    try {
        const { result } = await createProductsWorkflow(req.scope).run({
            input: {
                products: [{
                    title,
                    description,
                    status: ProductStatus.PUBLISHED,
                    thumbnail: image_url,
                    handle: title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
                    metadata: {
                        seller_id: seller_id,
                        rating: 5.0,
                        tier: "none"
                    },
                    category_ids: category_id ? [category_id] : [],
                    sales_channels: [{ id: salesChannel.id }],
                    options: [{ title: "Licensing", values: ["Standard"] }],
                    variants: [
                        {
                            title: "Standard License",
                            sku: `ACTOR-${Date.now()}`,
                            options: { Licensing: "Standard" },
                            prices: [{ amount: price, currency_code: "eur" }]
                        }
                    ]
                }]
            }
        })

        res.json({ product: result[0] })
    } catch (err: any) {
        console.error("[ACTOR_CREATE] Workflow Error:", err);
        res.status(err.status || 500).json({
            message: err.message || "Failed to create actor",
            type: err.type
        });
    }
}
