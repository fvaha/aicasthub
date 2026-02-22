import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const CONFIG_PATH = path.join(process.cwd(), "platform-config.json")

interface PlatformConfig {
    tiers: Record<string, {
        platform_fee_pct: number
        escrow_fee_pct: number
    }>
    updated_at: string
    updated_by: string
}

const readConfig = (): PlatformConfig => {
    if (!fs.existsSync(CONFIG_PATH)) {
        return {
            tiers: {
                none: { platform_fee_pct: 10, escrow_fee_pct: 3 },
                bronze: { platform_fee_pct: 8, escrow_fee_pct: 3 },
                silver: { platform_fee_pct: 5, escrow_fee_pct: 2 },
                gold: { platform_fee_pct: 3, escrow_fee_pct: 1 }
            },
            updated_at: new Date().toISOString(),
            updated_by: "system"
        }
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"))
}

const writeConfig = (config: PlatformConfig) => {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    // This route is under /api/admin/* so Medusa automatically ensures the user is an authenticated Admin.
    const body = req.body as Partial<PlatformConfig>

    const current = readConfig()
    const updated: PlatformConfig = {
        ...current,
        ...body,
        tiers: {
            ...current.tiers,
            ...(body.tiers || {})
        },
        updated_at: new Date().toISOString(),
        updated_by: "admin_user"
    }

    writeConfig(updated)
    console.log("[ADMIN-CONFIG] Config updated by admin:", JSON.stringify(updated))
    res.json({ config: updated, message: "Settings saved securely via Admin API" })
}
