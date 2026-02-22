import { model } from "@medusajs/framework/utils"

export const Actor = model.define("actor", {
    id: model.id().primaryKey(),
    name: model.text(),
    category: model.text(),
    price: model.number(),
    rating: model.number().default(5.0),
    image_url: model.text(),
    seller_id: model.text().index(),
    tier: model.enum(["gold", "silver", "bronze", "none"]).default("none"),
    description: model.text().nullable(),
})
