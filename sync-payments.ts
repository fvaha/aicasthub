import { Modules } from "@medusajs/framework/utils";
import { markPaymentCollectionAsPaid } from "@medusajs/core-flows";

export default async function ({ container }: any) {
    const query = container.resolve("query");
    const paymentModuleService = container.resolve(Modules.PAYMENT);
    const remoteLink = container.resolve("remoteLink");

    const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "currency_code", "total", "payment_collections.*"],
    });

    for (const o of orders) {
        if (!o.payment_collections || o.payment_collections.length === 0) {
            console.log("Fixing payment for order", o.id);

            const amount = o.total || 0;

            const pc = await paymentModuleService.createPaymentCollections({
                currency_code: o.currency_code || "eur",
                amount: amount,
            });

            await remoteLink.create({
                [Modules.ORDER]: { order_id: o.id },
                [Modules.PAYMENT]: { payment_collection_id: pc.id }
            });

            // use standard workflow
            if (amount > 0) {
                await markPaymentCollectionAsPaid(container).run({
                    input: {
                        order_id: o.id,
                        payment_collection_id: pc.id,
                    }
                });
            }
            console.log("Done for", o.id);
        }
    }
}
