import { Module } from "@medusajs/framework/utils"
import PayPalProviderService from "./service"

export default Module("paypal", {
    service: PayPalProviderService,
})
