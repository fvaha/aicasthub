import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function listCategories({ container }: ExecArgs) {
    const productModuleService = container.resolve(Modules.PRODUCT)
    const categories = await productModuleService.listProductCategories({}, {
        select: ["id", "name", "handle"]
    })

    console.log("------------------------------------------")
    console.log("EXISTING PRODUCT CATEGORIES:")
    console.log(JSON.stringify(categories, null, 2))
    console.log("------------------------------------------")
}
