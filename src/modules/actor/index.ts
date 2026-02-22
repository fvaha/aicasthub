import { Module } from "@medusajs/framework/utils"
import { ActorModuleService } from "./service"

export const ACTOR_MODULE = "actor"

export default Module(ACTOR_MODULE, {
    service: ActorModuleService,
})
