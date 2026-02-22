import { defineLink } from "@medusajs/framework/utils"
import UserModule from "@medusajs/medusa/user"
import ProfileModule from "../modules/profile"

export default defineLink(
    UserModule.linkable.user,
    ProfileModule.linkable.userProfile
)
