import { model } from "@medusajs/framework/utils"

export const Message = model.define("message", {
  id: model.id().primaryKey(),
  order_id: model.text().index(),
  from_id: model.text(),
  to_id: model.text(),
  text: model.text().nullable(),
  attachments: model.json().nullable(), // Store array of attachment objects
  is_read: model.boolean().default(false),
  timestamp: model.dateTime().nullable(),
})

export const JobContract = model.define("job_contract", {
  id: model.id().primaryKey(),
  order_id: model.text().unique().index(),
  client_id: model.text(),
  actor_id: model.text(),
  status: model.enum(["pending", "in_progress", "completed", "disputed"]).default("pending"),
  amount: model.number(),
  currency_code: model.text(),
  escrow_details: model.json().nullable(),
})
