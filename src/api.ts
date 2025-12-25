const BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function getServices(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  } catch (e) {
    return ['ENCH', 'BO', 'KD', 'BOSS'];
  }
}

export async function getPriceEstimate(hours: number) {
  const res = await fetch(`${BASE}/price?hours=${hours}`);
  if (!res.ok) throw new Error('Failed to get price');
  return res.json();
}

export async function submitBooking(payload: any) {
  const res = await fetch(`${BASE}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function getPacks() {
  const res = await fetch(`${BASE}/shop/packs`);
  if (!res.ok) throw new Error('Failed to fetch packs');
  return res.json();
}

export async function buyPack(packId: string) {
  const res = await fetch(`${BASE}/shop/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packId }),
  });
  return res;
}
