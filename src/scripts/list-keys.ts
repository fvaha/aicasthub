
import { ExecArgs } from "@medusajs/framework/types";

export default async function listKeys({ container }: ExecArgs) {
    const query = container.resolve("query")
    const { data: keys } = await query.graph({
        entity: "api_key",
        fields: ["id", "token", "title", "type"],
    })

    console.log("------------------------------------------")
    console.log("EXISTING API KEYS:")
    console.log(JSON.stringify(keys, null, 2))
    console.log("------------------------------------------")
}
