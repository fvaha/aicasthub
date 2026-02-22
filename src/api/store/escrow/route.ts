import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createEscrowWorkflow } from "../../../workflows/escrow/create-escrow"
import { releaseEscrowWorkflow } from "../../../workflows/escrow/release-escrow"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { order_id, amount, currency, buyer_id, seller_id } = req.body as any

    const { result } = await createEscrowWorkflow(req.scope)
        .run({
            input: {
                order_id,
                amount,
                currency,
                buyer_id,
                seller_id
            }
        })

    res.json({ escrow: result })
}

export const PATCH = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { escrow_id } = req.body as any

    const { result } = await releaseEscrowWorkflow(req.scope)
        .run({
            input: {
                escrow_id
            }
        })

    res.json({ escrow: result })
}
