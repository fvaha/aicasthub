import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const actorService = req.scope.resolve("actor") as any

    const [actors, count] = await actorService.listAndCountActors(
        {},
        {
            take: 20,
            skip: 0,
            order: { rating: "DESC" }
        }
    )

    res.json({
        actors,
        count
    })
}
