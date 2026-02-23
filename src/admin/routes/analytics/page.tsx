import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, CurrencyDollar, ArrowPath } from "@medusajs/icons"
import { Container, Heading, Text, Select } from "@medusajs/ui"
import { useState, useEffect } from "react"

const AnalyticsPage = () => {
    const [metrics, setMetrics] = useState<any>(null)
    const [period, setPeriod] = useState<string>("all")
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        fetchMetrics(period)
    }, [period])

    const fetchMetrics = async (p: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/medusa/admin/store-metrics?period=${p}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await res.json();
            setMetrics(data.metrics)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    return (
        <Container className="p-8 flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <Heading level="h1" className="text-2xl font-bold">Platform Analytics & Payouts</Heading>
                    <Text className="text-ui-fg-subtle">Track platform revenue, escrow flow, and gross volume.</Text>
                </div>
                <div>
                    <Select value={period} onValueChange={setPeriod}>
                        <Select.Trigger className="w-[150px]">
                            <Select.Value placeholder="Select period" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="day">Today</Select.Item>
                            <Select.Item value="week">Past 7 days</Select.Item>
                            <Select.Item value="month">Past 30 days</Select.Item>
                            <Select.Item value="year">Past year</Select.Item>
                            <Select.Item value="all">All Time</Select.Item>
                        </Select.Content>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center animate-pulse">
                    <ChartBar className="h-8 w-8 text-ui-fg-muted" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-ui-fg-subtle">
                            <ChartBar className="w-5 h-5 text-ui-tag-blue-icon" />
                            <Text className="text-xs font-semibold uppercase tracking-wider">Gross Volume (GMV)</Text>
                        </div>
                        <Heading level="h1" className="text-3xl font-black">€{metrics?.gross_volume_eur?.toFixed(2) || '0.00'}</Heading>
                        <Text className="text-[10px] text-ui-fg-muted">From {metrics?.total_orders || 0} complete or pending orders.</Text>
                    </div>

                    <div className="p-6 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-ui-fg-subtle">
                            <CurrencyDollar className="w-5 h-5 text-ui-tag-green-icon" />
                            <Text className="text-xs font-semibold uppercase tracking-wider">Platform Revenue</Text>
                        </div>
                        <Heading level="h1" className="text-3xl font-black text-green-600 dark:text-green-400">€{metrics?.platform_revenue_eur?.toFixed(2) || '0.00'}</Heading>
                        <Text className="text-[10px] text-ui-fg-muted">Net profit calculation (est. 10% fee).</Text>
                    </div>

                    <div className="p-6 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-ui-fg-subtle">
                            <ArrowPath className="w-5 h-5 text-ui-tag-orange-icon" />
                            <Text className="text-xs font-semibold uppercase tracking-wider">Escrow Held</Text>
                        </div>
                        <Heading level="h1" className="text-3xl font-black text-orange-600 dark:text-orange-400">€{metrics?.escrow_held_eur?.toFixed(2) || '0.00'}</Heading>
                        <Text className="text-[10px] text-ui-fg-muted">Money locked in active projects.</Text>
                    </div>

                    <div className="p-6 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-ui-fg-subtle">
                            <ChartBar className="w-5 h-5 text-ui-tag-purple-icon" />
                            <Text className="text-xs font-semibold uppercase tracking-wider">Payouts Paid/Due</Text>
                        </div>
                        <Heading level="h1" className="text-3xl font-black">€{metrics?.payouts_due_eur?.toFixed(2) || '0.00'}</Heading>
                        <Text className="text-[10px] text-ui-fg-muted">Creator's share generated on the platform.</Text>
                    </div>
                </div>
            )}

            <div className="mt-8 p-6 bg-ui-bg-subtle/30 rounded-2xl border border-ui-border-base text-center text-ui-fg-subtle">
                <Text>More granular daily/weekly charts will populate here as your data grows.</Text>
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Analytics & Payouts",
    icon: ChartBar,
})

export default AnalyticsPage
