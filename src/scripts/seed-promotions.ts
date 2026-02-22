import { ExecArgs } from "@medusajs/framework/types";
import {
    createProductCategoriesWorkflow,
    createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedPromotionTiers({ container }: ExecArgs) {
    const query = container.resolve("query");

    console.log("Fetching region and sales channel...");
    const { data: regions } = await query.graph({ entity: "region", fields: ["id"] });
    const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id"] });

    if (!regions.length || !salesChannels.length) {
        console.error("Missing region or sales channel");
        return;
    }

    const regionId = regions[0].id;
    const salesChannelId = salesChannels[0].id;

    console.log("Creating 'Seller Services' category...");
    const { result: categories } = await createProductCategoriesWorkflow(container).run({
        input: {
            product_categories: [
                {
                    name: "Seller Services",
                    is_active: true,
                    is_internal: true, // Hide from regular buyers
                    rank: 0,
                    metadata: { type: "service" }
                }
            ]
        }
    });

    const categoryId = categories[0].id;

    console.log("Creating Promotion Products...");

    const promotionProducts = [
        {
            title: "Gold Tier Boost",
            description: "30 Days Guaranteed Top Spot, Featured on Homepage, Search Result Priority #1",
            price: 99.00,
            tier: "gold",
            duration_days: 30
        },
        {
            title: "Silver Tier Boost",
            description: "15 Days Boosted Visibility, Top 10 in Category Search, Verified Creator Badge",
            price: 49.00,
            tier: "silver",
            duration_days: 15
        },
        {
            title: "Bronze Tier Boost",
            description: "7 Days Visibility Boost, Appears in 'Featured' tab",
            price: 19.00,
            tier: "bronze",
            duration_days: 7
        }
    ];

    for (const prod of promotionProducts) {
        await createProductsWorkflow(container).run({
            input: {
                products: [{
                    title: prod.title,
                    description: prod.description,
                    status: "published",
                    category_ids: [categoryId],
                    sales_channels: [{ id: salesChannelId }],
                    options: [{ title: "Tier", values: [prod.title] }],
                    variants: [{
                        title: prod.title,
                        options: { "Tier": prod.title },
                        prices: [{
                            amount: prod.price * 100, // Medusa uses cents
                            currency_code: "eur"
                        }]
                    }],
                    metadata: {
                        is_subscription: true,
                        tier_type: prod.tier,
                        duration_days: prod.duration_days
                    }
                }]
            }
        });
        console.log(`Created: ${prod.title} (€${prod.price})`);
    }

    console.log("✅ Promotion packages seeded successfully.");
}
