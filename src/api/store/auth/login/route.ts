import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { email } = req.body as any
    const query = req.scope.resolve("query")

    // Find customer by email
    const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "last_name"],
        filters: { email }
    })

    if (customers.length === 0) {
        return res.status(401).json({ message: "User not found" })
    }

    const customer = customers[0]

    // Find profile role
    const profileService = req.scope.resolve("profile") as any
    const profiles = await profileService.listUserProfiles({ user_id: customer.id })

    res.json({
        customer,
        profile: profiles[0] || { role: "buyer" }
    })
}
