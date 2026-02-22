import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const orderModuleService = container.resolve(Modules.ORDER);

    const orders = await orderModuleService.listOrders({}, { relations: ["payment_collections", "fulfillments"] });
    if (orders.length > 0) {
        console.log(JSON.stringify(orders[0], null, 2));
        const paymentModuleService = container.resolve(Modules.PAYMENT);
        console.log("PAYMENT COLLECTIONS:", await paymentModuleService.listPaymentCollections({}));
    } else {
        console.log("no orders");
    }
}
