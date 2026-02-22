import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Label, Button, Badge, StatusBadge, Tooltip } from "@medusajs/ui"
import { CurrencyDollar, CheckCircleSolid, Sparkles, ShieldCheck } from "@medusajs/icons"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState, useEffect } from "react"

const FeesPage = () => {
    const [prices, setPrices] = useState<any>({
        tiers: {
            none: { platform_fee_pct: 20, escrow_fee_pct: 3, label: "Standard" },
            bronze: { platform_fee_pct: 15, escrow_fee_pct: 2.5, label: "Bronze" },
            silver: { platform_fee_pct: 12, escrow_fee_pct: 2, label: "Silver" },
            gold: { platform_fee_pct: 8, escrow_fee_pct: 1.5, label: "Gold" }
        }
    })
    const [isSaving, setIsSaving] = useState(false)

    // Fetch current config from the public store API (GET is public)
    const { data: configData, refetch } = useQuery({
        queryKey: ["platform-config"],
        queryFn: async () => {
            const res = await fetch("/api/store/platform-config")
            return res.json()
        }
    })

    useEffect(() => {
        if (configData?.config) {
            setPrices(configData.config)
        }
    }, [configData])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Securely save via Admin API (Authenticated)
            const res = await fetch('/api/admin/platform-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prices)
            })

            if (!res.ok) throw new Error("Failed to save via Admin API")

            const data = await res.json()
            setPrices(data.config)
            alert("Settings Saved: Global pricing structure updated securely.")
            refetch()
        } catch (err) {
            console.error("Save error:", err)
            alert("Save Failed: Could not update settings. Check server logs.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleTierChange = (tier: string, field: string, value: string) => {
        setPrices((prev: any) => ({
            ...prev,
            tiers: {
                ...prev.tiers,
                [tier]: {
                    ...prev.tiers[tier],
                    [field]: parseFloat(value) || 0
                }
            }
        }))
    }

    return (
        <Container className="bg-ui-bg-base border-ui-border-base shadow-elevation-card-rest rounded-xl p-8">
            <div className="flex justify-between items-center mb-8 border-b border-ui-border-base pb-6">
                <div>
                    <Heading className="text-ui-fg-base mb-2 text-2xl font-semibold tracking-tight">Global Fee & Pricing Engine</Heading>
                    <Text className="text-ui-fg-subtle">
                        Configure platform taxes, escrow fees, and subscription tier discounts.
                    </Text>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge color="blue">Global Mode</StatusBadge>
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        <CheckCircleSolid /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(prices.tiers).map(([key, tier]: [string, any]) => (
                    <div key={key} className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Heading level="h3" className="text-sm font-bold uppercase tracking-wider text-ui-fg-muted">{tier.label || key}</Heading>
                                {key !== 'none' && <Badge color="orange"><Sparkles className="h-3 w-3" /> Tier</Badge>}
                            </div>
                            <Text className="text-[10px] font-mono text-ui-fg-muted uppercase">Configuration</Text>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-ui-fg-subtle">Platform Fee (%)</Label>
                                <Input
                                    type="number"
                                    value={tier.platform_fee_pct}
                                    onChange={(e) => handleTierChange(key, "platform_fee_pct", e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-ui-fg-subtle">Escrow Fee (%)</Label>
                                <Input
                                    type="number"
                                    value={tier.escrow_fee_pct}
                                    onChange={(e) => handleTierChange(key, "escrow_fee_pct", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-2 p-3 bg-ui-bg-base rounded border border-ui-border-base shadow-inner">
                            <div className="flex justify-between text-xs mb-1">
                                <Text className="text-ui-fg-muted">Example Model Price:</Text>
                                <Text className="font-mono">€100.00</Text>
                            </div>
                            <div className="flex justify-between text-xs mb-1 text-rose-500">
                                <Text>+ Platform ({tier.platform_fee_pct}%)</Text>
                                <Text className="font-mono">€{tier.platform_fee_pct.toFixed(2)}</Text>
                            </div>
                            <div className="flex justify-between text-xs mb-2 text-blue-500">
                                <Text>+ Escrow ({tier.escrow_fee_pct}%)</Text>
                                <Text className="font-mono">€{tier.escrow_fee_pct.toFixed(2)}</Text>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-ui-border-base pt-2 text-green-600">
                                <Text>Buyer Total:</Text>
                                <Text className="font-mono">€{(100 + tier.platform_fee_pct + tier.escrow_fee_pct).toFixed(2)}</Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 border border-orange-200 bg-orange-50 rounded-xl flex items-start gap-4">
                <ShieldCheck className="text-orange-600 h-6 w-6 mt-1" />
                <div>
                    <Heading className="text-orange-800 text-lg mb-1 font-semibold">Important Policy Notice</Heading>
                    <Text className="text-orange-700 text-sm">
                        Changes to global fees are applied in <strong>real-time</strong> to the catalog and checkout.
                        Active escrow projects created before the change will retain their original fee structure.
                        Ensure you notify sellers via the platform announcement tool before significant fee increases.
                    </Text>
                </div>
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Global Pricing",
    icon: CurrencyDollar,
})

export default FeesPage
