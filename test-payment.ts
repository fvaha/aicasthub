import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const orderModuleService = container.resolve(Modules.ORDER);
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    const remoteLink = container.resolve("remoteLink");

    const orders = await orderModuleService.listOrders({}, { take: 1, order: { created_at: "DESC" } });
    if (orders.length === 0) return console.log("no orders");

    const orderId = orders[0].id;
    const currencyCode = orders[0].currency_code;
    const amount = orders[0].total;

    console.log("Processing order:", orderId, "Amount:", amount);

    const paymentCollection = await paymentModuleService.createPaymentCollections({
        currency_code: currencyCode,
        amount: amount,
        status: "authorized"
    });

    console.log("Created Payment Collection:", paymentCollection.id);

    try {
        const linkDef = {
            [Modules.ORDER]: {
                order_id: orderId,
            },
            [Modules.PAYMENT]: {
                payment_collection_id: paymentCollection.id,
            },
        };
        await remoteLink.create(linkDef);
        console.log("Linked collection to order.");
    } catch (err: any) {
        console.error("Link error:", err.message);
    }
}
