import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type CreatePlatformUserStepInput = {
    email: string
    first_name: string
    last_name: string
    role: "buyer" | "seller"
    phone?: string
}

const createPlatformCustomerStep = createStep(
    "create-platform-customer",
    async (input: CreatePlatformUserStepInput, { container }) => {
        const customerService = container.resolve(Modules.CUSTOMER) as any
        const profileService = container.resolve("profile") as any

        // 1. Create Customer
        const customer = await customerService.createCustomers({
            email: input.email,
            first_name: input.first_name,
            last_name: input.last_name,
            phone: input.phone,
        })

        // 2. Add to appropriate Customer Group
        const groups = await customerService.listCustomerGroups({
            name: input.role === "seller" ? "Sellers" : "Buyers"
        })

        if (groups.length > 0) {
            await customerService.addCustomerToGroup({
                customer_id: customer.id,
                customer_group_id: groups[0].id
            })
        }

        // 3. Create Custom Profile
        const profile = await profileService.createUserProfiles({
            user_id: customer.id, // Using customer id as user_id link
            role: input.role,
            phone: input.phone,
        })

        return new StepResponse({ customer, profile }, { customerId: customer.id })
    },
    async (compensation, { container }) => {
        const customerService = container.resolve(Modules.CUSTOMER) as any
        if (compensation) {
            await customerService.deleteCustomers([compensation.customerId])
        }
    }
)

export const registerPlatformUserWorkflow = createWorkflow(
    "register-platform-user",
    (input: CreatePlatformUserStepInput) => {
        const result = createPlatformCustomerStep(input)
        return new WorkflowResponse(result)
    }
)
