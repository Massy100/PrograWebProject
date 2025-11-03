'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/buttonAccessTable.css';

export default function PendingAlert() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { getAccessTokenSilently } = useAuth0();
  const [visible, setVisible] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests/pending`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setPendingCount(data.length);
        setVisible(data.length > 0);
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };

    fetchPending();
  }, []);

  if (!visible) return null;

  return (
    <div className="alertContainer">
      <button
        className="alertBtn full"
        onClick={() => {
          localStorage.setItem('accessTab', 'Pending'); // activa pestaña Pending
          router.push('/access'); // redirige a la tabla
        }}
      >
        You have {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
      </button>
    </div>
  );
}
