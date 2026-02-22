import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { registerPlatformUserWorkflow } from "../../../../workflows/create-profile"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { email, first_name, last_name, role, phone, password } = req.body as any

    // Note: For a real production app, you would also handle auth identity/password creation here
    // In Medusa 2.0, this usually involves creating an invite or using the auth module directly
    // For this demonstration, we focus on the platform role link

    const { result } = await registerPlatformUserWorkflow(req.scope)
        .run({
            input: {
                email,
                first_name,
                last_name,
                role,
                phone
            }
        })

    res.json({
        customer: result.customer,
        profile: result.profile
    })
}
