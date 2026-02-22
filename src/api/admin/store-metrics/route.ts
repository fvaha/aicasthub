import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const query = req.scope.resolve("query");
    const { period } = req.query; // 'day', 'week', 'month', 'year', 'all'

    try {
        // Fetch all orders with their total. In production, consider pagination or specific date fiters in DB
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "total", "created_at", "status", "metadata"],
            filters: {} // In advanced setups, apply date filters here
        });

        const now = new Date();
        // Filter locally for simplicity based on period parameter
        const filteredOrders = orders.filter((o: any) => {
            if (period === 'all' || !period) return true;

            const orderDate = new Date(o.created_at);
            const diffTime = Math.abs(now.getTime() - orderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (period === 'day' && diffDays <= 1) return true;
            if (period === 'week' && diffDays <= 7) return true;
            if (period === 'month' && diffDays <= 30) return true;
            if (period === 'year' && diffDays <= 365) return true;

            return false;
        });

        let grossVolume = 0;
        let platformRevenue = 0;
        let successfulOrders = 0;
        let escrowTotal = 0;

        filteredOrders.forEach((o: any) => {
            const amount = o.total ? o.total / 100 : 0;
            grossVolume += amount;
            successfulOrders++;

            // Platform fee estimation (e.g. 10%). Adjust this to your real fee
            const feePercent = o.metadata?.platform_fee_percent || 10;
            platformRevenue += (amount * (feePercent / 100));

            if (o.metadata?.escrow_status === 'held' || o.metadata?.escrow_status === 'funded') {
                escrowTotal += amount;
            }
        });

        return res.json({
            metrics: {
                total_orders: successfulOrders,
                gross_volume_eur: grossVolume,
                platform_revenue_eur: platformRevenue,
                escrow_held_eur: escrowTotal,
                payouts_due_eur: grossVolume - platformRevenue - escrowTotal // Rough estimate
            },
            period: period || 'all',
            count: filteredOrders.length
        });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}
