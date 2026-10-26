export type OrderStatus = 'pending' | 'paid' 

export type Order = {
    id: string
    productId: string
    quantity: number
    amount: number
    status: OrderStatus
}

export const orders = new Map<string, Order>()

