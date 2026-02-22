import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Select, usePrompt } from "@medusajs/ui"
import { Sparkles } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const AI_ATTRIBUTES = {
    gender: ['Any', 'Female', 'Male', 'Stylized/Creature'],
    age: ['Any', 'Young', 'Adult', 'Senior'],
    style: ['Realistic', 'Cartoon', 'Anime', 'Cinematic'],
    resolution: ['1080p', '4K', '8K'],
    speed: ['Standard', '24h Delivery', '48h Delivery']
}

const ActorAttributesWidget = () => {
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [meta, setMeta] = useState<any>({})
    const prompt = usePrompt()

    useEffect(() => {
        if (!id) return;
        setLoading(true)
        fetch(`/admin/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.product) {
                    const existingMeta = data.product.metadata || {}
                    setMeta({
                        gender: existingMeta.gender || 'Any',
                        age: existingMeta.age || 'Any',
                        style: existingMeta.style || 'Realistic',
                        resolution: existingMeta.resolution || '4K',
                        speed: existingMeta.speed || 'Standard'
                    })
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    const handleSave = async () => {
        if (!id) return
        setSaving(true)
        try {
            // First fetch the latest to not overwrite other metadata
            const getRes = await fetch(`/admin/products/${id}`)
            const data = await getRes.json()
            const existingMetadata = data.product?.metadata || {}

            const response = await fetch(`/admin/products/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metadata: {
                        ...existingMetadata,
                        ...meta
                    }
                })
            })

            if (response.ok) {
                prompt({
                    title: "Success",
                    description: "AI Actor Attributes saved successfully.",
                })
            } else {
                throw new Error("Failed to save")
            }
        } catch (e) {
            prompt({
                title: "Error",
                description: "Could not save attributes.",
            })
        }
        setSaving(false)
    }

    if (loading) return null;

    return (
        <Container className="p-6 flex flex-col gap-4 mt-6">
            <div className="flex items-center gap-2 border-b border-ui-border-base pb-4">
                <Sparkles className="text-ui-fg-interactive" />
                <Heading level="h2">AI Actor Configuration</Heading>
            </div>
            <Text className="text-ui-fg-subtle text-sm">Configure digital parameters instead of physical shipping attributes (Weight, Size, etc.). These sync globally to the storefront filters.</Text>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                    <Text className="text-sm font-semibold">Gender</Text>
                    <Select value={meta.gender} onValueChange={(val) => setMeta({ ...meta, gender: val })}>
                        <Select.Trigger><Select.Value /></Select.Trigger>
                        <Select.Content>
                            {AI_ATTRIBUTES.gender.map(g => <Select.Item key={g} value={g}>{g}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Text className="text-sm font-semibold">Age Group</Text>
                    <Select value={meta.age} onValueChange={(val) => setMeta({ ...meta, age: val })}>
                        <Select.Trigger><Select.Value /></Select.Trigger>
                        <Select.Content>
                            {AI_ATTRIBUTES.age.map(g => <Select.Item key={g} value={g}>{g}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Text className="text-sm font-semibold">Visual Style</Text>
                    <Select value={meta.style} onValueChange={(val) => setMeta({ ...meta, style: val })}>
                        <Select.Trigger><Select.Value /></Select.Trigger>
                        <Select.Content>
                            {AI_ATTRIBUTES.style.map(g => <Select.Item key={g} value={g}>{g}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Text className="text-sm font-semibold">Max Resolution</Text>
                    <Select value={meta.resolution} onValueChange={(val) => setMeta({ ...meta, resolution: val })}>
                        <Select.Trigger><Select.Value /></Select.Trigger>
                        <Select.Content>
                            {AI_ATTRIBUTES.resolution.map(g => <Select.Item key={g} value={g}>{g}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>

                <div className="flex flex-col gap-2">
                    <Text className="text-sm font-semibold">Delivery Speed</Text>
                    <Select value={meta.speed} onValueChange={(val) => setMeta({ ...meta, speed: val })}>
                        <Select.Trigger><Select.Value /></Select.Trigger>
                        <Select.Content>
                            {AI_ATTRIBUTES.speed.map(g => <Select.Item key={g} value={g}>{g}</Select.Item>)}
                        </Select.Content>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-ui-border-base">
                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                    Save Attributes
                </Button>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.before",
})

export default ActorAttributesWidget
