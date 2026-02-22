import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const { id } = req.params;
    const { rating, comment } = req.body as any; // rating: 'positive' or 'negative'

    try {
        const orderModuleService = req.scope.resolve(Modules.ORDER) as any;
        const productModuleService = req.scope.resolve(Modules.PRODUCT) as any;

        // 1. Get current order
        const [order] = await orderModuleService.listOrders({ id: [id] });
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.metadata?.buyer_review) {
            return res.status(400).json({ error: "Review already submitted for this project. Reviews are permanent." });
        }

        const currentMeta = order.metadata || {};

        // 2. Mark review on Order
        await orderModuleService.updateOrders(id, {
            metadata: {
                ...currentMeta,
                buyer_review: {
                    rating,
                    comment,
                    date: new Date().toISOString()
                }
            }
        });

        // 3. Increment Actor/Product stats if possible
        const actorId = currentMeta.actor_id;
        if (actorId) {
            try {
                const [product] = await productModuleService.listProducts({ id: [actorId] });
                if (product) {
                    const pMeta = product.metadata || {};
                    const totalReviews = (pMeta.total_reviews || 0) + 1;
                    const positive = rating === 'positive' ? 1 : 0;
                    const negative = rating === 'negative' ? 1 : 0;

                    const newPos = (pMeta.positive_reviews_count || 0) + positive;
                    const newNeg = (pMeta.negative_reviews_count || 0) + negative;

                    await productModuleService.updateProducts(actorId, {
                        metadata: {
                            ...pMeta,
                            total_reviews: totalReviews,
                            positive_reviews_count: newPos,
                            negative_reviews_count: newNeg,
                            // Optionally recalculate a percentage out of 100
                            positive_reviews: Math.round((newPos / totalReviews) * 100)
                        }
                    });
                }
            } catch (err: any) {
                console.log("Failed to update product stats:", err.message);
            }
        }

        return res.json({ success: true, message: "Review permanently recorded." });

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
