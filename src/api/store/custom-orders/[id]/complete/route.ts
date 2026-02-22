import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params

    try {
        const orderModuleService = req.scope.resolve(Modules.ORDER) as any

        // Get current order to merge metadata
        const [existing] = await orderModuleService.listOrders({ id: [id] })
        const currentMeta = existing?.metadata || {}

        // Update order status to completed
        await orderModuleService.updateOrders(id, {
            status: "completed",
            payment_status: "captured",
            fulfillment_status: "fulfilled",
            metadata: {
                ...currentMeta,
                completed_at: new Date().toISOString(),
                escrow_status: "released"
            }
        })

        res.json({
            success: true,
            message: "Order marked as completed and funds released."
        })
    } catch (err: any) {
        console.error("Error completing order:", err);
        res.status(500).json({ message: err.message })
    }
}
