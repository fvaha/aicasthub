import { Module } from "@medusajs/framework/utils"
import { EscrowModuleService } from "./service"

export const ESCROW_MODULE = "escrow"

export default Module(ESCROW_MODULE, {
    service: EscrowModuleService,
})
