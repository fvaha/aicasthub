import { ExecArgs } from "@medusajs/framework/types";
import { Modules, ApiKeyType } from "@medusajs/framework/utils";
import { linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows";

export default async function linkApiKey({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const query = container.resolve("query");
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("Linking Publishable API Key to Default Sales Channel using Workflow...");

    // 1. Get Default Sales Channel
    const [salesChannel] = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    // 2. Get the API Key
    const { data: keys } = await query.graph({
        entity: "api_key",
        fields: ["id", "token"],
        filters: {
            type: ApiKeyType.PUBLISHABLE
        }
    });

    if (!salesChannel || keys.length === 0) {
        logger.error("Missing Sales Channel or API Key!");
        return;
    }

    const apiKeyId = keys[0].id;

    // 3. Run Workflow
    await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: {
            id: apiKeyId,
            add: [salesChannel.id]
        }
    });

    logger.info(`Successfully linked API Key (${apiKeyId}) to Sales Channel (${salesChannel.id})`);
}
