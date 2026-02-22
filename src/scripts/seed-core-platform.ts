import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
    ProductStatus
} from "@medusajs/framework/utils";
import {
    createProductCategoriesWorkflow,
    createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedAIEcommerce({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const storeModuleService = container.resolve(Modules.STORE);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
    const productService = container.resolve(Modules.PRODUCT);

    logger.info("Starting AI Cast Hub Core Seeding (Improved Idempotency)...");

    // 1. Ensure Store & Sales Channel
    const [store] = await storeModuleService.listStores();
    const [salesChannel] = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    // 2. Create Customer Groups
    logger.info("Creating Customer Groups...");
    const customerGroupService = container.resolve(Modules.CUSTOMER) as any;
    const groupsToCreate = ["Buyers", "Sellers", "Bronze Members", "Silver Members", "Gold Members"];

    for (const name of groupsToCreate) {
        const existing = await customerGroupService.listCustomerGroups({ name });
        if (existing.length === 0) {
            await customerGroupService.createCustomerGroups([{ name }]);
            logger.info(`Created group: ${name}`);
        }
    }

    // 3. Create AI Actor Categories
    logger.info("Creating AI Actor Categories...");
    const categoryNames = ["Fashion & Lifestyle", "Commercials & TV", "Voice Synthesis", "3D & Gaming", "Virtual Influencers"];

    for (const name of categoryNames) {
        const existing = await productService.listProductCategories({ name });
        if (existing.length === 0) {
            try {
                await createProductCategoriesWorkflow(container).run({
                    input: { product_categories: [{ name, is_active: true }] }
                });
                logger.info(`Created category: ${name}`);
            } catch (e) {
                logger.warn(`Could not create category ${name}: ${e.message}`);
            }
        }
    }

    const categories = await productService.listProductCategories({ name: categoryNames });

    // 4. Create AI Actors as Products
    logger.info("Creating AI Actors as Products...");

    const actors = [
        {
            title: "Elena V3",
            category_name: "Fashion & Lifestyle",
            description: "Hyper-realistic virtual model specializing in high-end fashion shoots.",
            price: 450,
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            handle: "elena-v3",
            rating: 4.9,
            tier: "gold"
        },
        {
            title: "Marcus Echo",
            category_name: "Voice Synthesis",
            description: "AI-driven male voice actor with 50+ unique tones.",
            price: 120,
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
            handle: "marcus-echo",
            rating: 4.7,
            tier: "silver"
        },
        {
            title: "Aria Realism",
            category_name: "Commercials & TV",
            description: "The most realistic AI face on the market for TV commercials.",
            price: 600,
            image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop",
            handle: "aria-realism",
            rating: 5.0,
            tier: "gold"
        },
        {
            title: "Kai Digital",
            category_name: "Virtual Influencers",
            description: "The next generation virtual influencer for Gen-Z brands.",
            price: 300,
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop",
            handle: "kai-digital",
            rating: 4.5,
            tier: "bronze"
        }
    ];

    for (const actor of actors) {
        const existing = await productService.listProducts({ handle: actor.handle });
        const category = categories.find(c => c.name === actor.category_name);

        if (existing.length === 0) {
            await createProductsWorkflow(container).run({
                input: {
                    products: [{
                        title: actor.title,
                        handle: actor.handle,
                        description: actor.description,
                        status: ProductStatus.PUBLISHED,
                        thumbnail: actor.image,
                        images: [{ url: actor.image }],
                        metadata: {
                            rating: actor.rating,
                            tier: actor.tier
                        },
                        category_ids: category ? [category.id] : [],
                        sales_channels: [{ id: salesChannel.id }],
                        options: [{ title: "Licensing", values: ["Commercial", "Standard"] }],
                        variants: [
                            {
                                title: "Standard License",
                                sku: `${actor.handle.toUpperCase()}-STD`,
                                options: { Licensing: "Standard" },
                                prices: [{ amount: actor.price, currency_code: "eur" }]
                            },
                            {
                                title: "Commercial License",
                                sku: `${actor.handle.toUpperCase()}-COMM`,
                                options: { Licensing: "Commercial" },
                                prices: [{ amount: actor.price * 2, currency_code: "eur" }]
                            }
                        ]
                    }]
                }
            });
            logger.info(`Created product for ${actor.title}`);
        } else {
            await productService.updateProducts(existing[0].id, {
                metadata: {
                    rating: actor.rating,
                    tier: actor.tier
                }
            });
            logger.info(`Updated metadata for ${actor.title}`);
        }
    }

    logger.info("AI Actors seeding complete!");
}
