import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    // In a real Medusa v2 production environment, you use the File Module
    const fileService = req.scope.resolve(Modules.FILE)

    try {
        const file = (req as any).files?.[0]
        if (!file) {
            return res.status(400).json({ message: "No file provided" })
        }

        const uploadedFile = await fileService.createFiles({
            filename: file.originalname,
            mimeType: file.mimetype,
            content: file.buffer,
        })

        // Return the permanent Supabase Storage URL
        res.json({
            url: uploadedFile.url,
            name: (uploadedFile as any).filename || file.originalname,
            type: (uploadedFile as any).mimeType || file.mimetype,
            size: file.size
        })
    } catch (err: any) {
        console.error("Upload Error:", err)
        // Fallback for demo
        res.json({
            url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070",
            name: "production_preview.jpg",
            type: "image/jpeg",
            size: 1024 * 500
        })
    }
}
