import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const query = container.resolve("query");

    const { data } = await query.graph({
        entity: "order",
        fields: ["*", "summary", "total", "item_total", "items.*"],
    });

    console.log(JSON.stringify(data[0], null, 2));
}
