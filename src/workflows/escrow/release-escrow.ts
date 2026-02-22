import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type ReleaseEscrowInput = {
    escrow_id: string
}

const releaseEscrowStep = createStep(
    "release-escrow-payment",
    async (input: ReleaseEscrowInput, { container }) => {
        const escrowService = container.resolve("escrow") as any
        const orderModuleService = container.resolve(Modules.ORDER) as any

        const accounts = await escrowService.listEscrowAccounts({ id: input.escrow_id })
        const accountToRelease = accounts[0]
        if (!accountToRelease) throw new Error("Escrow account not found")

        const account = await escrowService.updateEscrowAccounts({
            id: input.escrow_id,
            status: "released",
            released_at: new Date()
        })

        if (accountToRelease.order_id) {
            try {
                await orderModuleService.updateOrders({
                    id: accountToRelease.order_id,
                    fulfillment_status: "fulfilled",
                    status: "completed"
                })
                console.log(`[Escrow Released] Order ${accountToRelease.order_id} marked as fulfilled & completed`)
            } catch (e: any) {
                console.warn(`[Escrow] Failed to update order status on release: ${e.message}`)
            }
        }

        return new StepResponse(account, input.escrow_id)
    }
)

export const releaseEscrowWorkflow = createWorkflow(
    "release-escrow",
    (input: ReleaseEscrowInput) => {
        const account = releaseEscrowStep(input)
        return new WorkflowResponse(account)
    }
)
