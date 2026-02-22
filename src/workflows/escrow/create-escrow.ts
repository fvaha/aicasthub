import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type CreateEscrowInput = {
    order_id: string
    amount: number
    currency: string
    buyer_id: string
    seller_id: string
}

const createEscrowStep = createStep(
    "create-escrow-account",
    async (input: CreateEscrowInput, { container }) => {
        const escrowService = container.resolve("escrow") as any
        const orderModuleService = container.resolve(Modules.ORDER) as any

        const account = await escrowService.createEscrowAccounts({
            order_id: input.order_id,
            amount: input.amount,
            currency: input.currency,
            buyer_id: input.buyer_id,
            seller_id: input.seller_id,
            status: "held"
        })

        try {
            await orderModuleService.updateOrders({
                id: input.order_id,
                payment_status: "captured"
            })
            console.log(`[Escrow Created] Order ${input.order_id} marked as captured`)
        } catch (e: any) {
            console.warn(`[Escrow] Failed to update order payment status: ${e.message}`)
        }

        return new StepResponse(account, account.id)
    },
    async (id, { container }) => {
        const escrowService = container.resolve("escrow") as any
        await escrowService.deleteEscrowAccounts([id])
    }
)

export const createEscrowWorkflow = createWorkflow(
    "create-escrow",
    (input: CreateEscrowInput) => {
        const account = createEscrowStep(input)
        return new WorkflowResponse(account)
    }
)
