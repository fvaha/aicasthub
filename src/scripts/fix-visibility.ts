import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function fixProductVisibility({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const query = container.resolve("query");
    const link = container.resolve("link");
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("Fixing Product Visibility for Storefront...");

    // 1. Get Default Sales Channel
    const [salesChannel] = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    if (!salesChannel) {
        logger.error("Default Sales Channel not found!");
        return;
    }

    // 2. Get all products
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "status"],
    });

    logger.info(`Found ${products.length} products total.`);

    for (const product of products) {
        logger.info(`Processing ${product.title} (Status: ${product.status})...`);

        // Ensure product is Published
        // await container.resolve("product").updateProducts(product.id, { status: "published" });

        // Link to Sales Channel
        try {
            await link.create({
                [Modules.PRODUCT]: {
                    product_id: product.id,
                },
                [Modules.SALES_CHANNEL]: {
                    sales_channel_id: salesChannel.id,
                },
            });
            logger.info(`Linked ${product.title} to Default Sales Channel.`);
        } catch (e) {
            logger.warn(`Link likely exists for ${product.title}`);
        }
    }

    logger.info("Product Visibility Fix Complete.");
}
