import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const query = container.resolve("query");
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const remoteLink = container.resolve("remoteLink");

    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
    let locations = await stockLocationModule.listStockLocations({});
    if (locations.length === 0) return console.log("no location");
    const location_id = locations[0].id;

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "items.*", "items.detail.*", "fulfillments.*"],
    });

    for (const o of orders) {
        if (!o.fulfillments || o.fulfillments.length === 0) {
            console.log("Fulfilling order manually", o.id);
            try {
                const fulItems = o.items.map((i: any) => ({
                    title: i.title || "Item",
                    quantity: i.detail?.quantity || 1,
                    barcode: "TEST",
                    line_item_id: i.id,
                }));

                const ful = await fulfillmentModuleService.createFulfillment({
                    location_id: location_id,
                    provider_id: "manual_manual",
                    delivery_address: {
                        first_name: "Buyer",
                        last_name: "Guest",
                        address_1: "123 Ai Street",
                        city: "Metropolis",
                        country_code: "US",
                    },
                    items: fulItems as any,
                    order: o as any,
                });

                await remoteLink.create({
                    [Modules.ORDER]: { order_id: o.id },
                    [Modules.FULFILLMENT]: { fulfillment_id: ful.id }
                });
                console.log("Linked fulfillment!");
            } catch (err: any) {
                console.log("Error:", err.message);
            }
        }
    }
}
