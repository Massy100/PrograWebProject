'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserOverview from '@/components/UserOverview';
import TransactionsTable, { TxRow } from '@/components/tableTrasactions';
import BigCardKpi from '@/components/BigCardKpi';
import "./single-user-overview.css"

type BackendUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  last_ip: string | null;
  referred_code: string | null;
  used_referred_code: string | null;
  created_at: string;
  modified_at: string;
  client_profile?: {
    balance_available: number;
    balance_blocked: number;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function UserOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  
  const {getAccessTokenSilently} = useAuth0();
  const [userData, setUserData] = useState<{ user: any; wallet: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = await getAccessTokenSilently();
        setLoading(true);
        console.log('Fetching user with ID:', userId);
        
        const res = await fetch(`${API_BASE_URL}/users/${userId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const backendUser: BackendUser = await res.json();
        console.log('Backend user data:', backendUser);
        
        const transformedUser = {
          id: backendUser.id.toString(),
          name: `${backendUser.first_name} ${backendUser.last_name}`.trim() || backendUser.username,
          email: backendUser.email,
          phone: backendUser.phone,
          last_ip: backendUser.last_ip,
          referral_code: backendUser.referred_code,
          referral_used: !!backendUser.used_referred_code,
          created_at: backendUser.created_at,
          updated_at: backendUser.modified_at,
        };

        const transformedWallet = {
          id: `wallet-${backendUser.id}`,
          user_id: backendUser.id.toString(),
          balance_available: backendUser.client_profile?.balance_available || 0,
          balance_blocked: backendUser.client_profile?.balance_blocked || 0,
        };

        setUserData({
          user: transformedUser,
          wallet: transformedWallet
        });
        setError(null);
      } catch (err) {
        console.error('Error obtaining user', err);
        setError('User data could not be loaded');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="div-user-sigle-admin">
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>Loading user data...</div>
          <button 
            onClick={() => router.push('/user-administration')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Get back to list
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="div-user-sigle-admin">
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ color: '#d32f2f' }}>{error}</div>
          <button 
            onClick={() => router.push('/user-administration')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="div-user-sigle-admin">
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>Usuario no encontrado</div>
          <button 
            onClick={() => router.push('/user-administration')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const balance_total = userData.wallet.balance_available + userData.wallet.balance_blocked;

  return (
    <div className="div-user-sigle-admin">
      {/* Botón de volver y título */}
      <a href="/user-administration" className="btn-return" aria-label="Return">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points="9 6 15 12 9 18" transform="matrix(-1 0 0 1 24 0)" />
        </svg>
        <h3 className="title-user-single-admin">Account Details</h3>
      </a>

      {/* Sección de resumen con BigCardKpi */}
      <div className="summary-div-transactions-user">
        <BigCardKpi title="Total Balance" value={`Q.${balance_total}`} />
      </div>

      {/* Información del usuario */}
      <div className="info-user">
        <UserOverview user={userData.user} wallet={userData.wallet} />
      </div>

      {/* Tabla de transacciones */}
      <div className="div-transactions">
        <TransactionsTable rows={mockTxRows} />
      </div>
    </div>
  );
}