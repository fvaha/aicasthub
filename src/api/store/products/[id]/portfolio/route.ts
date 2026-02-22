import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const { id } = req.params;
    const query = req.scope.resolve("query");

    try {
        const { data: messages } = await query.graph({
            entity: "message",
            fields: ["id", "text", "attachments", "order_id", "from_id", "sender_name", "created_at"],
            filters: {} // No complex JSON filter supported here natively without deep ORM
        });

        // Get completed orders for this actor
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "status", "metadata", "created_at"]
        });

        const completedForActor = orders.filter((o: any) =>
            (o.status === 'completed' || o.metadata?.escrow_status === 'released') &&
            o.metadata?.actor_id === id
        );

        const portfolioItems = completedForActor.map((o: any) => {
            const orderMessages = messages.filter((m: any) => m.order_id === o.id).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            // "Kao neka slika sta je uradjeno" -> Look for the first message with an attachment from the Seller (from_id !== buyer, usually from_id = seller_id)
            const deliveryMsg = [...orderMessages].reverse().find(m => Array.isArray(m.attachments) && m.attachments.length > 0 && !m.attachments[0].isPreview);
            const initialRequest = o.metadata?.project_details || orderMessages[0]?.text || "Private Project briefing";

            const attachments = (deliveryMsg?.attachments || []) as any[];

            return {
                id: o.id,
                date: o.created_at,
                request: initialRequest,
                delivery: attachments[0]?.url || null,
                delivery_type: attachments[0]?.type || null,
                review: o.metadata?.buyer_review || null
            }
        }).filter(item => item.delivery); // Only show items where there's an actual final delivery file

        return res.json({ portfolio: portfolioItems });

    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
