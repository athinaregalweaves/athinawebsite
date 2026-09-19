/** Parse created_at / updated_at for comparison */
function orderTs(o: { created_at?: unknown; updated_at?: unknown }): number {
  const raw = o.created_at ?? o.updated_at;
  const t = new Date(String(raw || "")).getTime();
  return Number.isFinite(t) ? t : 0;
}

function pickNewer(a: any, b: any): any {
  const ta = orderTs(a);
  const tb = orderTs(b);
  if (tb !== ta) return tb > ta ? b : a;
  const ida = Number(a?.id) || 0;
  const idb = Number(b?.id) || 0;
  return idb >= ida ? b : a;
}

/**
 * Collapse duplicate checkout rows: same numeric `id` or same `order_number`
 * keeps the newest by created_at (then higher id).
 */
export function dedupeOrdersList(orders: any[]): any[] {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const byId = new Map<number, any>();
  for (const o of orders) {
    const id = Number(o?.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const cur = byId.get(id);
    if (!cur) byId.set(id, o);
    else byId.set(id, pickNewer(cur, o));
  }

  const withId = Array.from(byId.values());
  const withoutId = orders.filter((o) => {
    const id = Number(o?.id);
    return !Number.isFinite(id) || id <= 0;
  });

  const byNumber = new Map<string, any>();
  const noNumber: any[] = [];

  for (const o of [...withId, ...withoutId]) {
    const num = String(o?.order_number ?? "").trim();
    if (!num) {
      noNumber.push(o);
      continue;
    }
    const cur = byNumber.get(num);
    if (!cur) byNumber.set(num, o);
    else byNumber.set(num, pickNewer(cur, o));
  }

  return [...Array.from(byNumber.values()), ...noNumber].sort((a, b) => orderTs(b) - orderTs(a));
}
