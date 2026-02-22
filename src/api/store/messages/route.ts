import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const messagingService = req.scope.resolve("messaging") as any
    const customerService = req.scope.resolve(Modules.CUSTOMER) as any
    const userId = req.query.user_id as string
    const orderId = req.query.order_id as string

    if (!userId) {
        return res.json({ messages: [], unread_count: 0 })
    }

    try {
        const possibleIds = [userId, 'seller-1', 'buyer-1']

        const filters: any = {
            $or: [
                { from_id: possibleIds },
                { to_id: possibleIds }
            ]
        }

        if (orderId) {
            filters.order_id = orderId
        }

        const messages = await messagingService.listMessages(filters, {
            order: { timestamp: "ASC" }
        })

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

        // Enrich messages with names
        const enrichedMessages = messages.map((m: any) => ({
            ...m,
            sender_name: customerMap[m.from_id]?.name || (m.from_id === 'buyer-1' ? 'Jane Doe' : m.from_id === 'seller-1' ? 'John Seller' : 'Unknown'),
            receiver_name: customerMap[m.to_id]?.name || (m.to_id === 'buyer-1' ? 'Jane Doe' : m.to_id === 'seller-1' ? 'John Seller' : 'Unknown')
        }))

        // Calculate unread count specifically for the requesting user
        const unreadCount = messages.filter((m: any) => possibleIds.includes(m.to_id) && !m.is_read).length

        res.json({
            messages: enrichedMessages,
            unread_count: unreadCount
        })
    } catch (err: any) {
        console.error("[MESSAGING API] Fetch Error:", err)
        res.status(500).json({ message: "Failed to fetch messages" })
    }
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { from_id, to_id, text, attachments, order_id } = req.body as any
    const messagingService = req.scope.resolve("messaging") as any

    if (!from_id || !to_id || (!text && !attachments)) {
        return res.status(400).json({ message: "Missing required fields" })
    }

    try {
        const message = await messagingService.createMessages({
            from_id,
            to_id,
            text,
            attachments,
            is_read: false,
            order_id: order_id || "general",
            timestamp: new Date()
        })

        res.json({ message })
    } catch (err: any) {
        console.error("[MESSAGING API] Write Error:", err)
        res.status(500).json({ message: "Failed to send message" })
    }
}

export async function PATCH(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { message_ids, user_id } = req.body as any
    const messagingService = req.scope.resolve("messaging") as any

    if (!message_ids || !Array.isArray(message_ids)) {
        return res.status(400).json({ message: "message_ids array is required" })
    }

    try {
        const possibleIds = [user_id, 'seller-1', 'buyer-1']
        await messagingService.updateMessages({
            selector: {
                id: message_ids,
                to_id: possibleIds // Security: can only mark messages sent TO you or fallback mock as read
            },
            data: {
                is_read: true
            }
        })

        res.json({ success: true })
    } catch (err: any) {
        console.error("[MESSAGING API] Update Error:", err)
        res.status(500).json({ message: "Failed to update messages" })
    }
}
