import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import {
    createPriceListsWorkflow
} from "@medusajs/medusa/core-flows";

export default async function seedTiers({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const query = container.resolve("query");
    const customerModuleService = container.resolve(Modules.CUSTOMER) as any;

    logger.info("Checking for existing tiered subscription groups (Bronze/Silver/Gold)...");

    const existingGroups = await customerModuleService.listCustomerGroups();

    let bronzeGroup = existingGroups.find(g => g.name === "Bronze Members");
    let silverGroup = existingGroups.find(g => g.name === "Silver Members");
    let goldGroup = existingGroups.find(g => g.name === "Gold Members");

    if (!bronzeGroup) {
        logger.info("Creating Bronze Members group...");
        [bronzeGroup] = await customerModuleService.createCustomerGroups([{ name: "Bronze Members" }]);
    }

    if (!silverGroup) {
        logger.info("Creating Silver Members group...");
        [silverGroup] = await customerModuleService.createCustomerGroups([{ name: "Silver Members" }]);
    }

    if (!goldGroup) {
        logger.info("Creating Gold Members group...");
        [goldGroup] = await customerModuleService.createCustomerGroups([{ name: "Gold Members" }]);
    }

    const bronzeGroupId = bronzeGroup.id;
    const silverGroupId = silverGroup.id;
    const goldGroupId = goldGroup.id;

    // 2. Get all actor variants
    const { data: variants } = await query.graph({
        entity: "product_variant",
        fields: ["id", "sku"],
    });

    const variantPricesBronze = variants.map(v => ({
        variant_id: v.id,
        amount: 350, // Slight discount
        currency_code: "eur"
    }));

    const variantPricesSilver = variants.map(v => ({
        variant_id: v.id,
        amount: 300,
        currency_code: "eur"
    }));

    const variantPricesGold = variants.map(v => ({
        variant_id: v.id,
        amount: 250,
        currency_code: "eur"
    }));

    // 3. Create Price Lists
    logger.info("Creating Subscription Tier Price Lists...");
    try {
        await createPriceListsWorkflow(container).run({
            input: {
                price_lists_data: [
                    {
                        title: "Bronze Member Discounts",
                        description: "Exclusive discount for Bronze tier members.",
                        status: "active",
                        prices: variantPricesBronze,
                        rules: {
                            customer_group_id: [bronzeGroupId]
                        }
                    },
                    {
                        title: "Silver Member Discounts",
                        description: "Exclusive discount for Silver tier members.",
                        status: "active",
                        prices: variantPricesSilver,
                        rules: {
                            customer_group_id: [silverGroupId]
                        }
                    },
                    {
                        title: "Gold Member Discounts",
                        description: "Exclusive discount for Gold tier members.",
                        status: "active",
                        prices: variantPricesGold,
                        rules: {
                            customer_group_id: [goldGroupId]
                        }
                    }
                ]
            }
        });
        logger.info("Successfully seeded Bronze, Silver and Gold tiers!");
    } catch (err) {
        logger.error("Error creating Price Lists: " + err.message);
    }
}
