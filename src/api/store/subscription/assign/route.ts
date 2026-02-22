import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { customer_id, tier } = req.body as any
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER) as any

    const groupName = tier === 'gold' ? 'Gold Members' : tier === 'silver' ? 'Silver Members' : 'Bronze Members'

    const [group] = await customerModuleService.listCustomerGroups({ name: groupName })

    if (group) {
        await customerModuleService.addCustomerToGroup({
            customer_id: customer_id,
            customer_group_id: group.id
        })
    }

    res.json({ success: true, tier: groupName })
}
