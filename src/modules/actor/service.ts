import { MedusaService } from "@medusajs/framework/utils"
import { Actor } from "./models/actor"

export class ActorModuleService extends MedusaService({
    Actor,
}) { }
