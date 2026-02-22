import { MedusaService } from "@medusajs/framework/utils"
import { EscrowAccount } from "./models/escrow"

export class EscrowModuleService extends MedusaService({
    EscrowAccount,
}) { }
