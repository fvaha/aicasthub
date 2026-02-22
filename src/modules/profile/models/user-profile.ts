import { model } from "@medusajs/framework/utils"

export const UserProfile = model.define("user_profile", {
    id: model.id().primaryKey(),
    user_id: model.text().unique().index(),
    role: model.enum(["buyer", "seller"]).default("buyer"),
    phone: model.text().nullable(),
    bio: model.text().nullable(),
    avatar_url: model.text().nullable(),
    company_name: model.text().nullable(),
})
