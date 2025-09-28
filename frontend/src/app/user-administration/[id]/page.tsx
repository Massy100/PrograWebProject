// app/user-administration/[id]/page.tsx
import KpiCard from '@/components/KpiCard';
import { notFound } from 'next/navigation';
import "./single-user-admin.css";
import UserOverview, { User, Wallet } from '@/components/UserOverview';
import TransactionsTable, { TxRow } from '@/components/tableTrasactions';

/** Opcional: si tu detalle debe ser siempre fresco */
// export const dynamic = 'force-dynamic';
// o usa revalidate global si tu API es cacheable.

type PageProps = { params: { id: string } };

// BASE URL del backend (ajústala en tu .env.local)
// NEXT_PUBLIC_API_URL=http://localhost:8000
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ---------- MOCKS (para ver funcionamiento mientras no haya backend) ----------
const mockUser = (id: string): User => ({
  id,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 555 0100",
  last_ip: "203.0.113.42",
  referral_code: "REF-9XY7Z",
  referral_used: true,
  created_at: "2024-08-15T14:22:10Z",
  updated_at: "2025-02-03T09:11:04Z",
});

const mockWallet = (user_id: string): Wallet => ({
  id: "wal_987",
  user_id,
  balance_available: 1250.5,
  balance_blocked: 150.0,
});

const mockTxRows: TxRow[] = [
  {
    code: 'AAPL',
    stock: 'Apple Inc.',
    transaction_type: 'buy',
    quantity: 10,
    unit_price: 35.75,
    total_amount: 357.5,
    created_at: '2025-09-01T10:12:00Z',
    is_active: true,
  },
  {
    code: 'GOOGL',
    stock: 'Alphabet Class A',
    transaction_type: 'sell',
    quantity: 3,
    unit_price: 120.2,
    total_amount: -60.6,
    created_at: '2025-08-29T15:45:00Z',
    is_active: false,
  },
  {
    code: 'AMZN',
    stock: 'Amazon.com',
    transaction_type: 'buy',
    quantity: 1,
    unit_price: 1500,
    total_amount: 1500,
    created_at: new Date(),
    is_active: true,
  },
  {
    code: 'TSLA',
    transaction_type: 'sell',
    quantity: 2,
    unit_price: 220.55,
    total_amount: 441.1,
    created_at: '2025-07-20T09:00:00Z',
    is_active: true,
  },
];

// ---------- FETCHERS (comentados para cuando conectes Django) ----------
/*
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}/`, {
    // cache: 'no-store',            // siempre fresco
    next: { revalidate: 60 },        // o cache revalidable
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('User not found');
  // Mapea la respuesta de Django a tu tipo User si difiere
  const data = await res.json();
  return {
    id: String(data.id),
    name: data.full_name ?? data.name,
    email: data.email,
    phone: data.phone ?? '',
    last_ip: data.last_ip ?? '',
    referral_code: data.referral_code ?? '',
    referral_used: Boolean(data.referral_used),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

async function fetchWallet(userId: string): Promise<Wallet> {
  const res = await fetch(`${API_BASE}/api/wallets/${userId}/`, {
    next: { revalidate: 60 },
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Wallet not found');
  const data = await res.json();
  return {
    id: String(data.id),
    user_id: String(data.user_id),
    balance_available: Number(data.balance_available),
    balance_blocked: Number(data.balance_blocked),
  };
}

async function fetchTransactions(userId: string): Promise<TxRow[]> {
  const res = await fetch(`${API_BASE}/api/transactions/?user_id=${userId}`, {
    next: { revalidate: 60 },
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Transactions not found');
  const list = await res.json();
  // Ajusta campos si tu serializer usa otros nombres
  return list.map((t: any) => ({
    code: t.code ?? t.symbol ?? null,
    stock: t.stock ?? t.asset_name ?? undefined,
    transaction_type: t.transaction_type, // 'buy' | 'sell'
    total_amount: Number(t.total_amount),
    created_at: t.created_at,
    is_active: Boolean(t.is_active),
    quantity: t.quantity != null ? Number(t.quantity) : undefined,
    unit_price: t.unit_price != null ? Number(t.unit_price) : undefined,
  })) as TxRow[];
}
*/

export default async function UserPage({ params }: PageProps) {
  const id = String(params.id);

  // ---------- HOY: usa mocks para ver la UI ----------
  const user = mockUser(id);
  const wallet = mockWallet(id);
  const rows = mockTxRows;

  // Si quieres validar que el id exista (solo en mock)
  const allowedIds = ['1','2','3'];
  if (!allowedIds.includes(id)) return notFound();

  // ---------- MAÑANA: activa el fetch real (sustituye mocks) ----------
  /*
  let user: User, wallet: Wallet, rows: TxRow[];
  try {
    [user, wallet, rows] = await Promise.all([
      fetchUser(id),
      fetchWallet(id),
      fetchTransactions(id),
    ]);
  } catch (e) {
    // Si falla el back, puedes decidir:
    // - notFound()
    // - o fallback a mocks para no romper la UI
    // return notFound();
    console.error(e);
    user = mockUser(id);
    wallet = mockWallet(id);
    rows = mockTxRows;
  }
  */

  return (
    <>
      <div className="div-user-sigle-admin">
        <a href="/user-administration" className="btn-return" aria-label="Return">
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <polyline fill="none" stroke="currentColor" strokeWidth="2" points="9 6 15 12 9 18" transform="matrix(-1 0 0 1 24 0)" />
          </svg>
          <h3 className="title-user-single-admin">Account Details</h3>
        </a>
        <div className="summary-div-transactions-user">
          <KpiCard title="Earned Total" value={150} format="money" dark />
          <KpiCard title="Invested Total" value={150} format="money" />
          <KpiCard title="Stocks Buy" value={10} format="number" />
          <KpiCard title="Stocks Sell" value={15} format="number" />
        </div>

        <div className="info-user">
          <UserOverview user={user} wallet={wallet} />
        </div>

        <div className="div-transactions">
          <TransactionsTable rows={rows} />
        </div>
      </div>
    </>
  );
}
