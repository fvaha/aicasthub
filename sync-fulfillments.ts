import { Modules } from "@medusajs/framework/utils";
import { createOrderFulfillmentWorkflow } from "@medusajs/core-flows";

export default async function ({ container }: any) {
    const query = container.resolve("query");

    const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
    let locations = await stockLocationModule.listStockLocations({});
    if (locations.length === 0) {
        await stockLocationModule.createStockLocations({
            name: "Default Location",
        });
        locations = await stockLocationModule.listStockLocations({});
    }
    const location_id = locations[0].id;
    console.log("Using location:", location_id);

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "items.*", "items.detail.*", "fulfillments.*"],
    });

    for (const o of orders) {
        // Note: unfulfilled check uses detail
        const unfulfilledItems = o.items?.filter((i: any) => i.detail && i.detail.quantity > i.detail.fulfilled_quantity) || [];

        if (!o.fulfillments || o.fulfillments.length === 0) {
            if (unfulfilledItems.length > 0) {
                console.log("Fulfilling order", o.id);

                const payloadItems = unfulfilledItems.map((i: any) => ({
                    id: i.id,
                    quantity: i.detail.quantity - i.detail.fulfilled_quantity,
                }));

                try {
                    await createOrderFulfillmentWorkflow(container).run({
                        input: {
                            order_id: o.id,
                            items: payloadItems,
                            location_id,
                        }
                    });
                    console.log("Success for", o.id);
                } catch (err: any) {
                    console.error("Error for", o.id, err.message);
                }
            } else {
                console.log("Order", o.id, "has NO items to fulfill, but has no fulfillments. Generating dummy items? Or skipping...");
            }
        } else {
            console.log("Order", o.id, "already has a fulfillment");
        }
    }
}
