import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"

const CONFIG_PATH = path.join(process.cwd(), "platform-config.json")

export interface PlatformConfig {
    platform_fee_pct: number      // % fee the platform takes
    escrow_fee_pct: number        // % fee for escrow service
    tiers: {
        none: TierConfig          // no subscription (standard buyer)
        bronze: TierConfig
        silver: TierConfig
        gold: TierConfig
    }
    updated_at: string
    updated_by: string
}

export interface TierConfig {
    platform_fee_pct: number
    escrow_fee_pct: number
    label: string
    color: string
}

const DEFAULT_CONFIG: PlatformConfig = {
    platform_fee_pct: 20,
    escrow_fee_pct: 3,
    tiers: {
        none: {
            platform_fee_pct: 20,
            escrow_fee_pct: 3,
            label: "Standard",
            color: "grey"
        },
        bronze: {
            platform_fee_pct: 15,
            escrow_fee_pct: 2.5,
            label: "Bronze",
            color: "orange"
        },
        silver: {
            platform_fee_pct: 12,
            escrow_fee_pct: 2,
            label: "Silver",
            color: "grey"
        },
        gold: {
            platform_fee_pct: 8,
            escrow_fee_pct: 1.5,
            label: "Gold",
            color: "orange"
        }
    },
    updated_at: new Date().toISOString(),
    updated_by: "system"
}

function readConfig(): PlatformConfig {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, "utf-8")
            return JSON.parse(raw) as PlatformConfig
        }
    } catch (e) {
        console.warn("[platform-config] Failed to read config, using defaults:", e)
    }
    return DEFAULT_CONFIG
}

function writeConfig(config: PlatformConfig): void {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")
}

// GET — public, returns current config
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const config = readConfig()
    res.json({ config })
}
