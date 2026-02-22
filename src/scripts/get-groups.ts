import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function getGroups({ container }: ExecArgs) {
    const customerModuleService = container.resolve(Modules.CUSTOMER);
    const groups = await customerModuleService.listCustomerGroups();
    console.log("CUSTOMER_GROUPS_LIST:", JSON.stringify(groups));
}
