import { API_BASE_URL } from "@/lib/env";

const API_BASE = API_BASE_URL;

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  customer_id?: number;
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_key: string;
  amount: number;
  currency: string;
}

export async function createOrder(data: OrderData): Promise<{ order_id: number; order_number: string }> {
  const res = await fetch(`${API_BASE}/orders.php?action=create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create order');
  return json;
}

export async function createPayment(orderId: number, amount: number): Promise<RazorpayPaymentData> {
  const res = await fetch(`${API_BASE}/orders.php?action=create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, amount }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Payment initiation failed');
  return json;
}

export async function verifyPayment(data: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  order_id: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/orders.php?action=verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Payment verification failed');
}

export async function markPaymentFailed(orderId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders.php?action=mark-payment-failed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not mark payment as failed');
}

export async function trackOrder(orderNumber: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders.php?action=track&order_number=${encodeURIComponent(orderNumber)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Order not found');
  return json;
}
