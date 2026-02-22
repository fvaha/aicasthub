import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id: orderId } = req.params
    const messagingService = req.scope.resolve("messaging") as any
    const customerService = req.scope.resolve(Modules.CUSTOMER) as any

    try {
        // Fetch all messages for this order regardless of user
        const messages = await messagingService.listMessages(
            { order_id: orderId },
            { order: { timestamp: "ASC" } }
        )

        // Fetch participant names
        const participantIds = Array.from(new Set([
            ...messages.map((m: any) => m.from_id),
            ...messages.map((m: any) => m.to_id)
        ]))

        const customers = await customerService.listCustomers({
            id: participantIds
        })

        const customerMap = customers.reduce((acc: any, curr: any) => {
            acc[curr.id] = {
                name: `${curr.first_name || ""} ${curr.last_name || ""}`.trim() || curr.email,
                email: curr.email
            }
            return acc
        }, {})

        // Enrich messages with names for admin view
        const enrichedMessages = messages.map((m: any) => ({
            ...m,
            sender_name: customerMap[m.from_id]?.name || (m.from_id === 'buyer-1' ? 'Jane Doe' : m.from_id === 'seller-1' ? 'John Seller' : m.from_id),
            receiver_name: customerMap[m.to_id]?.name || (m.to_id === 'buyer-1' ? 'Jane Doe' : m.to_id === 'seller-1' ? 'John Seller' : m.to_id)
        }))

        res.json({ messages: enrichedMessages })
    } catch (err: any) {
        console.error("[ADMIN MESSAGING API] Fetch Error:", err)
        res.status(500).json({ message: "Failed to fetch order messages" })
    }
}
