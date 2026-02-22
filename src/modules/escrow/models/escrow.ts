import { model } from "@medusajs/framework/utils"

export const EscrowAccount = model.define("escrow_account", {
    id: model.id().primaryKey(),
    order_id: model.text().index(),
    amount: model.number(),
    currency: model.text(),
    status: model.enum(["held", "released", "refunded", "disputed"]).default("held"),
    buyer_id: model.text(),
    seller_id: model.text(),
    released_at: model.dateTime().nullable(),
})
