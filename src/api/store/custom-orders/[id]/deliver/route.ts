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

        // Update order metadata to mark as delivered
        await orderModuleService.updateOrders(id, {
            metadata: {
                ...currentMeta,
                deliver_status: "delivered",
                delivered_at: new Date().toISOString()
            }
        })

        res.json({
            success: true,
            message: "Project marked as delivered."
        })
    } catch (err: any) {
        console.error("Error delivering order:", err);
        res.status(500).json({ message: err.message })
    }
}
