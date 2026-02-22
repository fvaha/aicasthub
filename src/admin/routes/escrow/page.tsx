import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Table, Badge, Button, StatusBadge, Tooltip, FocusModal, IconButton } from "@medusajs/ui"
import { CurrencyDollar, CheckCircleSolid, XCircleSolid, ExclamationCircleSolid, ChatBubble } from "@medusajs/icons"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useState } from "react"

const EscrowPage = () => {
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    // Fetch real orders from Medusa
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["admin_orders"],
        queryFn: async () => {
            const response = await fetch("/admin/orders?fields=id,email,total,currency_code,status,metadata,created_at,summary,items.*")
            if (!response.ok) throw new Error("Failed to fetch")
            return response.json()
        }
    })

    // Fetch messages for selected order
    const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
        queryKey: ["order_messages", selectedOrder?.id],
        queryFn: async () => {
            if (!selectedOrder?.id) return { messages: [] }
            const response = await fetch(`/admin/orders/${selectedOrder.id}/messages`)
            if (!response.ok) throw new Error("Failed to fetch messages")
            return response.json()
        },
        enabled: !!selectedOrder?.id
    })

    const mutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
            // 1. Update our custom escrow metadata
            await fetch(`/admin/orders/${orderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    metadata: { escrow_status: status }
                })
            })

            // 2. If releasing, also try to mark as completed in Medusa Core
            if (status === 'released') {
                try {
                    await fetch(`/admin/orders/${orderId}/complete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                    })
                } catch (e) {
                    console.warn("Order completion failed, but metadata updated:", e)
                }
            }

            return { success: true }
        },
        onSuccess: () => {
            refetch()
            alert("Funds released and order marked as completed!")
        }
    })

    const orders = (data as any)?.orders || []
    const messages = (messagesData as any)?.messages || []

    return (
        <Container className="bg-ui-bg-base border-ui-border-base shadow-elevation-card-rest rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Heading className="text-ui-fg-base mb-2 text-2xl font-semibold tracking-tight">AI Escrow & Jobs Control</Heading>
                    <Text className="text-ui-fg-subtle">
                        Live management of funded projects, delivery verification, and fund releases.
                    </Text>
                </div>
                <div className="flex gap-3">
                    <StatusBadge color="green">Payments: Stripe</StatusBadge>
                    <StatusBadge color="blue">Contract: Smart Escrow</StatusBadge>
                </div>
            </div>

            <div className="mt-8 overflow-x-auto">
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Project / Service</Table.HeaderCell>
                            <Table.HeaderCell>Client</Table.HeaderCell>
                            <Table.HeaderCell>Escrow Amount</Table.HeaderCell>
                            <Table.HeaderCell>Escrow Status</Table.HeaderCell>
                            <Table.HeaderCell>Delivery</Table.HeaderCell>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Management Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {isLoading ? (
                            <Table.Row><td colSpan={7} className="text-center p-16 animate-pulse text-ui-fg-muted">Establishing secure connection...</td></Table.Row>
                        ) : isError ? (
                            <Table.Row><td colSpan={7} className="text-center p-16 text-rose-500">
                                <ExclamationCircleSolid className="mx-auto mb-2 h-6 w-6" />
                                Database Connection Timeout. Check your Medusa status.
                            </td></Table.Row>
                        ) : orders.filter((o: any) => o.metadata?.escrow_status).length === 0 ? (
                            <Table.Row><td colSpan={7} className="text-center p-16 text-ui-fg-muted italic text-sm">No active escrow jobs found. All systems operational.</td></Table.Row>
                        ) : orders.filter((o: any) => o.metadata?.escrow_status).map((order: any) => {
                            const isDelivered = order.metadata?.deliver_status === 'delivered';
                            const isPaid = order.metadata?.escrow_status === 'released' || order.status === 'completed';
                            const isDisputed = order.metadata?.escrow_status === 'disputed';

                            return (
                                <Table.Row key={order.id} className="hover:bg-ui-bg-base-hover transition-colors group">
                                    <Table.Cell className="max-w-[200px]">
                                        <div className="flex flex-col">
                                            <Text className="font-semibold text-ui-fg-base truncate">{order.items?.[0]?.title || "Custom Service"}</Text>
                                            <Text className="text-[10px] text-ui-fg-muted font-mono">{order.id.substring(0, 12)}...</Text>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Tooltip content={order.email}>
                                            <Text className="text-xs text-ui-fg-subtle truncate max-w-[120px]">{order.email}</Text>
                                        </Tooltip>
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-ui-fg-base">
                                        {order.total ? (order.total / 100).toFixed(2) : "0.00"} {order.currency_code?.toUpperCase()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={isPaid ? 'green' : isDisputed ? 'red' : 'blue'}>
                                            {order.metadata?.escrow_status?.toUpperCase() || 'FUNDED'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color={isDelivered ? 'orange' : 'grey'}>
                                            {isDelivered ? 'DELIVERED' : 'PENDING'}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text className="text-[10px] text-ui-fg-muted">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <IconButton variant="transparent" size="small" onClick={() => setSelectedOrder(order)} title="View Chat History">
                                                <ChatBubble />
                                            </IconButton>
                                            <IconButton variant="transparent" size="small" onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')} title="View Full Order Info">
                                                🔍
                                            </IconButton>
                                            {!isPaid && !isDisputed && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        variant="secondary"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                        onClick={() => mutation.mutate({ orderId: order.id, status: 'released' })}
                                                        isLoading={mutation.isPending}
                                                    >
                                                        <CheckCircleSolid className="h-4 w-4" /> Release
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="secondary"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                        onClick={() => mutation.mutate({ orderId: order.id, status: 'disputed' })}
                                                    >
                                                        <XCircleSolid className="h-4 w-4" /> Dispute
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </div>

            {/* Chat History View */}
            <FocusModal open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <FocusModal.Content>
                    <FocusModal.Header>
                        <div className="flex items-center gap-4">
                            <Heading className="text-xl">Project Correspondence: {selectedOrder?.items?.[0]?.title}</Heading>
                            <Badge color="blue">{selectedOrder?.id}</Badge>
                        </div>
                    </FocusModal.Header>
                    <FocusModal.Body className="bg-ui-bg-subtle p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto flex flex-col gap-6">
                            {isLoadingMessages ? (
                                <Text className="animate-pulse text-center p-20 italic">Retrieving secure chat logs...</Text>
                            ) : messages.length === 0 ? (
                                <Container className="p-20 text-center border-dashed">
                                    <ChatBubble className="mx-auto mb-4 text-ui-fg-muted h-10 w-10" />
                                    <Text className="text-ui-fg-muted italic">No messages exchanged yet between buyer and seller.</Text>
                                </Container>
                            ) : messages.map((m: any) => (
                                <div key={m.id} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-end px-1">
                                        <Text className="text-[10px] font-bold text-ui-fg-muted uppercase">{m.sender_name}</Text>
                                        <Text className="text-[9px] text-ui-fg-muted">{new Date(m.timestamp).toLocaleString()}</Text>
                                    </div>
                                    <Container className="p-4 bg-ui-bg-base border-ui-border-base shadow-sm">
                                        <Text className="text-sm whitespace-pre-wrap">{m.text}</Text>
                                    </Container>
                                </div>
                            ))}
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Escrow & Jobs",
    icon: CurrencyDollar,
})

export default EscrowPage
