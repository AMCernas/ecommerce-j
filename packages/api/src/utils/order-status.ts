export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'failed' | 'cancelled';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'failed', 'cancelled'],
  paid: ['shipped', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  refunded: [],
  failed: ['pending', 'cancelled'],
  cancelled: [],
};

export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions = ORDER_STATUS_TRANSITIONS[currentStatus as OrderStatus];
  if (!transitions) {
    return false;
  }
  return transitions.includes(newStatus as OrderStatus);
}

export function getAllowedTransitions(currentStatus: string): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus as OrderStatus] || [];
}
