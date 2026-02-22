import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const query = container.resolve("query");

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "items.*", "items.detail.*"],
    });

    const o = orders[0];
    console.log(JSON.stringify(o.items, null, 2));
}
