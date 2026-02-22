import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function seedAIActors({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const actorService = container.resolve("actor") as any;
    const profileService = container.resolve("profile") as any;
    const userService = container.resolve(Modules.USER);

    logger.info("Seeding AI Actors, Sellers and Buyers...");

    const getOrCreateUser = async (email: string, firstName: string, lastName: string) => {
        const [existing] = await userService.listUsers({ email });
        if (existing) {
            return existing;
        }
        return await userService.createUsers({
            email,
            first_name: firstName,
            last_name: lastName,
        });
    }

    // 1. Create Users
    const seller1 = await getOrCreateUser("seller1@aicasthub.com", "John", "Seller");
    const seller2 = await getOrCreateUser("seller2@aicasthub.com", "Jane", "Agent");
    const buyer1 = await getOrCreateUser("buyer1@client.com", "Alex", "Brand");

    // 2. Create Profiles
    const profiles = [
        {
            user_id: seller1.id,
            role: "seller",
            company_name: "AI Talent Agency",
            phone: "+1234567890"
        },
        {
            user_id: seller2.id,
            role: "seller",
            company_name: "Virtual Stars",
            phone: "+1987654321"
        },
        {
            user_id: buyer1.id,
            role: "buyer",
            company_name: "Global Marketing Group",
            phone: "+1112223333"
        }
    ];

    for (const p of profiles) {
        const [existing] = await profileService.listUserProfiles({ user_id: p.user_id });
        if (!existing) {
            await profileService.createUserProfiles([p]);
        }
    }

    // 3. Create Actors
    const actors = [
        {
            name: "Elena V3 (Virtual Avatar)",
            category: "Fashion & Lifestyle",
            price: 450,
            rating: 4.9,
            tier: "gold",
            image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            seller_id: seller1.id,
            description: "Hyper-realistic virtual model specializing in high-end fashion shoots."
        },
        {
            name: "Marcus Echo",
            category: "Voice Synthesis & Narration",
            price: 120,
            rating: 4.8,
            tier: "silver",
            image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
            seller_id: seller1.id,
            description: "AI-driven male voice actor with 50+ unique tones."
        },
        {
            name: "CyberPunk 2077 Pack",
            category: "3D Animation & Gaming",
            price: 890,
            rating: 5.0,
            tier: "bronze",
            image_url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
            seller_id: seller2.id,
            description: "A collection of 5 unique cyberpunk-themed AI characters for gaming."
        },
        {
            name: "Aria (Hyper-Realistic)",
            category: "Commercials & TV",
            price: 600,
            rating: 4.7,
            tier: "none",
            image_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop",
            seller_id: seller2.id,
            description: "The most realistic AI face on the market for TV commercials."
        }
    ];

    for (const a of actors) {
        const [existing] = await actorService.listActors({ name: a.name });
        if (!existing) {
            await actorService.createActors([a]);
        }
    }

    logger.info("Successfully seeded AI Actors and Users!");
}
