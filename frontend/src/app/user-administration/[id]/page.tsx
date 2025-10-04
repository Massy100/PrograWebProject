import { notFound } from 'next/navigation';
import "./single-user-admin.css";
import UserOverview, { User, Wallet } from '@/components/UserOverview';
import TransactionsTable, { TxRow } from '@/components/tableTrasactions';
import BigCardKpi from '@/components/BigCardKpi';


type PageProps = { params: { id: string } };


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


export default async function UserPage({ params }: PageProps) {
  const id = String(params.id);

  const user = mockUser(id);
  const wallet = mockWallet(id);
  const rows = mockTxRows;

  const allowedIds = ['1','2','3'];
  if (!allowedIds.includes(id)) return notFound();

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
          <BigCardKpi title={''} value={''}/>
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
