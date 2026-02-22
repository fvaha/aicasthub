import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React from "react"

const UserProfileWidget = ({ data }: { data: any }) => {
    // We would normally fetch the profile here using a custom hook or sdk
    // For now, we'll simulate it or just show the UI structure

    return (
        <Container className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <Heading level="h2">AICastHub Profile</Heading>
                <Badge color="blue">Custom Extension</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Text size="small" className="text-ui-fg-subtle font-medium">Platform Role</Text>
                    <Text className="mt-1">Seller / Provider</Text>
                </div>
                <div>
                    <Text size="small" className="text-ui-fg-subtle font-medium">Company</Text>
                    <Text className="mt-1">AI Talent Agency</Text>
                </div>
                <div>
                    <Text size="small" className="text-ui-fg-subtle font-medium">Escrow Status</Text>
                    <Badge color="green">Verified</Badge>
                </div>
                <div>
                    <Text size="small" className="text-ui-fg-subtle font-medium">Active Models</Text>
                    <Text className="mt-1">12 AI Actors</Text>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "user.details.after",
})

export default UserProfileWidget
