import KpiCard from '@/components/KpiCard';
import { notFound } from 'next/navigation';
import "./single-user-admin.css"
import SidebarOptions from '@/components/navAdmin';
import SearchResults from '@/components/searchResults';
import UserOverview, { User, Wallet } from '@/components/UserOverview';
import TableUserAdministration from '@/components/TableUserAdministration';

type PageProps = {
  params: { id: string };
};

async function getUser(id: number) {
  const users = [
    { id: 1, username: 'grecia', full_name: 'Grecia López', email: 'grecia@example.com' },
    { id: 2, username: 'juan',   full_name: 'Juan Pérez',   email: 'juan@example.com' },
    { id: 3, username: 'maria',  full_name: 'María Ruiz',   email: 'maria@example.com' },
  ];
  return users.find(u => u.id === id) ?? null;
}

async function getUserAndWallet(id: string): Promise<{ user: User; wallet: Wallet }> {
  // Reemplaza con tu fetch real (cache: "no-store" si es necesario)
  return {
    user: {
      id,
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 555 0100",
      last_ip: "203.0.113.42",
      referral_code: "REF-9XY7Z",
      referral_used: true,
      created_at: "2024-08-15T14:22:10Z",
      updated_at: "2025-02-03T09:11:04Z",
    },
    wallet: {
      id: "wal_987",
      user_id: id,
      balance_available: 1250.5,
      balance_blocked: 150.0,
    },
  };
}


export default async function UserPage({ params }: PageProps) {
    const id = Number(params.id);
    const users = await getUser(id);
    const { user, wallet } = await getUserAndWallet(params.id);

  if (!users) return notFound();

  return (
    <>
        <SidebarOptions/>
        <SearchResults
            headerProps={{ isLoggedIn: true, marketOpen: true, totalAmount: 100 }}
            title="Resultados de la búsqueda"
        />

        <div className="div-user-sigle-admin">
            <h3 className='title-user-single-admin'>Account Details</h3>
            <div className="summary-div-transactions-user">
                <KpiCard
                    title="Earned Total"
                    value={150}
                    format="money"
                    dark
                />
                <KpiCard
                    title="Invested Total"
                    value={150}
                    format="money"
                />
                <KpiCard
                    title="Stocks Buy"
                    value={10}
                    format="number"
                />
                <KpiCard
                    title="Stocks Sell"
                    value={15}
                    format="number"
                />
            </div>
            <div className="info-user">
                <UserOverview user={user} wallet={wallet} />
            </div>
        
        </div>

      {/* aquí colocas más info: balances, creado el, tipo, etc. */}
    </>
  );
}
