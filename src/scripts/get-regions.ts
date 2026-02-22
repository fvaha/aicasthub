import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function getRegion({ container }: ExecArgs) {
    const regionModuleService = container.resolve(Modules.REGION);
    const regions = await regionModuleService.listRegions();
    console.log("REGIONS_LIST:", JSON.stringify(regions));
}
