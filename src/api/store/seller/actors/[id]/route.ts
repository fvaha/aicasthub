import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params
    const query = req.scope.resolve("query")

    try {
        const { data: products } = await query.graph({
            entity: "product",
            fields: ["id", "title", "description", "status", "thumbnail", "metadata", "variants.id", "variants.title", "variants.prices.*"],
            filters: { id: id }
        })

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Actor not found" })
        }

        res.json({ product: products[0] })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export async function PATCH(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { id } = req.params
    const { title, description, price, image_url } = req.body as any

    try {
        const productService = req.scope.resolve(Modules.PRODUCT) as any
        const pricingService = req.scope.resolve(Modules.PRICING) as any
        const query = req.scope.resolve("query")

        // 1. Update basic fields using (id, data) signature (Correct V2)
        if (title || description || image_url !== undefined) {
            const updateProps: any = {}
            if (title) updateProps.title = title
            if (description) updateProps.description = description
            if (image_url !== undefined) updateProps.thumbnail = image_url

            await productService.updateProducts(id, updateProps)
        }

        // 2. Handle Price updates
        if (price !== undefined && price !== null) {
            // Use query.graph because it handles the complicated Pricing -> Product links
            // This structure is proven to work in our GET route
            const { data: products } = await query.graph({
                entity: "product",
                fields: ["variants.id", "variants.prices.id", "variants.prices.currency_code"],
                filters: { id: id }
            })

            const variant = products?.[0]?.variants?.[0] as any
            if (variant) {
                const amount = Math.round(parseFloat(price))
                const eurPrice = variant.prices?.find((p: any) => p.currency_code === "eur")

                if (eurPrice) {
                    await pricingService.updatePrices([{
                        id: eurPrice.id,
                        amount: amount
                    }])
                } else {
                    await pricingService.createPrices([{
                        variant_id: variant.id,
                        amount: amount,
                        currency_code: "eur"
                    }])
                }
            }
        }

        // 3. Return fresh results using same structure as GET
        const { data: finalProducts } = await query.graph({
            entity: "product",
            fields: ["id", "title", "description", "status", "thumbnail", "metadata", "variants.id", "variants.prices.*"],
            filters: { id: id }
        })

        res.json({ product: finalProducts[0] })
    } catch (err: any) {
        console.error("[ACTOR_PATCH_FINAL_FIX_ERROR]:", err)
        res.status(500).json({
            message: err.message || "Failed to update actor",
            error: true
        })
    }
}
