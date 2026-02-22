import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve("query")
    const customerId = req.params.id

    try {
        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "first_name", "last_name", "groups.*"],
            filters: { id: customerId }
        })

        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "Customer not found" })
        }

        res.json({ customer: customers[0] })
    } catch (err: any) {
        console.error("Error fetching custom customer:", err)
        res.status(500).json({ message: err.message })
    }
}
