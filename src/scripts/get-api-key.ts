import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function getApiKey({ container }: ExecArgs) {
    const query = container.resolve("query");
    const { data: keys } = await query.graph({
        entity: "api_key",
        fields: ["id", "token", "type"],
        filters: {
            type: "publishable"
        }
    });
    console.log("API_KEYS_LIST:", JSON.stringify(keys));
}
