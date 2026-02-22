
import {
    createApiKeysWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function createKey(container) {
    const { result } = await createApiKeysWorkflow(container)
        .run({
            input: {
                api_keys: [
                    {
                        title: "Web Storefront",
                        type: "publishable",
                        created_by: ""
                    }
                ]
            }
        })

    const key = result[0]

    console.log("------------------------------------------")
    console.log("PUBLISHABLE API KEY CREATED:")
    console.log(key.token)
    console.log("------------------------------------------")
}
