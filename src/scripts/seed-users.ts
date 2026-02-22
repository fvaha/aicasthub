import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { registerPlatformUserWorkflow } from "../workflows/create-profile";

export default async function seedUsers({ container }: ExecArgs) {
    const logger = container.resolve("logger");

    logger.info("Seeding Test Seller and Test Buyer...");

    const users = [
        {
            email: "seller@aicasthub.com",
            first_name: "John",
            last_name: "Seller",
            role: "seller" as const,
            phone: "123456789"
        },
        {
            email: "buyer@aicasthub.com",
            first_name: "Jane",
            last_name: "Buyer",
            role: "buyer" as const,
            phone: "987654321"
        }
    ];

    for (const user of users) {
        try {
            await registerPlatformUserWorkflow(container).run({
                input: user
            });
            logger.info(`Registered ${user.role}: ${user.email}`);
        } catch (e) {
            logger.warn(`User ${user.email} already exists or error: ${e.message}`);
        }
    }

    logger.info("User seeding complete.");
}
