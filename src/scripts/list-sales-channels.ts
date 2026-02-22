import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function listSalesChannels({ container }: ExecArgs) {
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const channels = await salesChannelModuleService.listSalesChannels({})

    console.log("------------------------------------------")
    console.log("EXISTING SALES CHANNELS:")
    console.log(JSON.stringify(channels, null, 2))
    console.log("------------------------------------------")
}
