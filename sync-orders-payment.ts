import { Modules } from "@medusajs/framework/utils";

export default async function ({ container }: any) {
    const query = container.resolve("query");
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    const remoteLink = container.resolve("remoteLink");

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "currency_code", "total", "payment_collections.*", "fulfillments.*"],
    });

    console.log(`Found ${orders.length} orders to check.`);

    for (const o of orders) {
        const amount = o.total || 0;

        if (!o.payment_collections || o.payment_collections.length === 0) {
            console.log(`Creating payment for ${o.id} amount ${amount}`);
            const pc = await paymentModuleService.createPaymentCollections({
                currency_code: o.currency_code || "eur",
                amount: amount,
            });

            // Update to capture using raw db method or updatePaymentCollections ?
            // payment module update
            await paymentModuleService.updatePaymentCollections({
                id: pc.id,
                status: "captured", // Admin panel relies on PaymentCollection status
                authorized_amount: amount,
                captured_amount: amount,
            });

            await remoteLink.create({
                [Modules.ORDER]: { order_id: o.id },
                [Modules.PAYMENT]: { payment_collection_id: pc.id }
            });
            console.log("Linked payment collection!");
        }
    }
}
