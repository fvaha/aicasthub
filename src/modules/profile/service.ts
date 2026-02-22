import { MedusaService } from "@medusajs/framework/utils"
import { UserProfile } from "./models/user-profile"

export class ProfileModuleService extends MedusaService({
    UserProfile,
}) { }
