import { MedusaService } from "@medusajs/framework/utils"
import { Message, JobContract } from "./models/message"

class MessagingModuleService extends MedusaService({
    Message,
    JobContract,
}) {
}

export default MessagingModuleService
