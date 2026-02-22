import MessagingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MESSAGING_MODULE = "messaging"

export default Module(MESSAGING_MODULE, {
    service: MessagingModuleService,
})
