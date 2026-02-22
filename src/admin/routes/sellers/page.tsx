import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Text, Badge, Button } from "@medusajs/ui"
import { UsersSolid, EllipsisHorizontal } from "@medusajs/icons"

const SellersPage = () => {
    const sellers = [
        { name: "John Seller", email: "seller1@aicasthub.com", company: "AI Talent Agency", models: 12, sales: "€4,500" },
        { name: "Jane Agent", email: "seller2@aicasthub.com", company: "Virtual Stars", models: 5, sales: "€1,200" }
    ]

    return (
        <Container className="p-0 overflow-hidden">
            <div className="p-8 border-b border-ui-border-base flex items-center justify-between">
                <div>
                    <Heading level="h1">AI Providers (Sellers)</Heading>
                    <Text className="text-ui-fg-subtle">Manage all AI actors providers and their performance.</Text>
                </div>
                <Button variant="primary">Add Provider</Button>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Company</Table.HeaderCell>
                        <Table.HeaderCell>Models</Table.HeaderCell>
                        <Table.HeaderCell>Total Sales</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sellers.map((s) => (
                        <Table.Row key={s.email}>
                            <Table.Cell>
                                <div className="flex flex-col">
                                    <Text weight="plus">{s.name}</Text>
                                    <Text size="small" className="text-ui-fg-subtle">{s.email}</Text>
                                </div>
                            </Table.Cell>
                            <Table.Cell>{s.company}</Table.Cell>
                            <Table.Cell>{s.models}</Table.Cell>
                            <Table.Cell>{s.sales}</Table.Cell>
                            <Table.Cell><Badge color="green">Active</Badge></Table.Cell>
                            <Table.Cell><EllipsisHorizontal /></Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Sellers & Providers",
    icon: UsersSolid,
})

export default SellersPage
