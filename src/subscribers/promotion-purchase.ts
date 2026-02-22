import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function promotionPurchaseSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const query = container.resolve("query")
    const orderId = data.id

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "items", "metadata"],
        filters: { id: orderId }
    })

    if (!orders.length) return
    const order = orders[0]

    // We fetch the detailed products to check their metadata
    // We want to see if this item is a "Promotion Tier" service
    const productIds = order.items?.map((item: any) => item.product_id) || []

    if (productIds.length > 0) {
        const { data: products } = await query.graph({
            entity: "product",
            fields: ["id", "metadata"],
            filters: { id: productIds }
        })

        // Find if any bought product is a subscription tier
        const tierProduct = products.find((p: any) => p.metadata?.is_subscription)

        if (tierProduct && order.metadata?.target_actor_id) {
            const actorId = order.metadata.target_actor_id
            const purchasedTier = (tierProduct.metadata as any).tier_type

            console.log(`[Promotion Activated] Upgrading Actor ${actorId} to ${purchasedTier} tier...`)

            // Assuming `target_actor_id` is passed when creating the checkout intent from the frontend
            await updateProductsWorkflow(container).run({
                input: {
                    products: [{
                        id: actorId as string,
                        metadata: {
                            tier: purchasedTier,
                            promoted_at: new Date().toISOString(),
                            promotion_expires: new Date(Date.now() + ((tierProduct.metadata as any)?.duration_days * 24 * 60 * 60 * 1000)).toISOString()
                        }
                    }]
                }
            })
            console.log(`Successfully upgraded actor ${actorId}!`)
        }
    }
}

export const config: SubscriberConfig = {
    // When someone actually completes their checkout
    event: "order.placed",
}
