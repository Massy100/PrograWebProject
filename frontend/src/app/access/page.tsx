'use client';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useRef } from 'react';
import './access.css';

type UserRequest = {
  name: string;
  alias: string;
  email: string;
};

type HistoryItem = {
  name: string;
  alias: string;
  email: string;
  status: 'Approved' | 'Rejected';
  decidedBy: string;
};

export default function RequestsTable() {
  const { getAccessTokenSilently } = useAuth0();
  const [pending, setPending] = useState<UserRequest[]>([]);
  const [approved, setApproved] = useState<HistoryItem[]>([]);
  const [rejected, setRejected] = useState<HistoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('Josué');
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const tableRef = useRef<HTMLDivElement>(null);

  // ✅ Detectar si venís desde el botón de alerta
  useEffect(() => {
    const savedTab = localStorage.getItem('accessTab');
    if (savedTab === 'Pending') {
      setActiveTab('Pending');
      setTimeout(() => {
        const target = document.querySelector('.tx__wrap');
        if (target) {
            const offset = target.getBoundingClientRect().top + window.scrollY - 80; // ajustá 80 según tu header
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
        }, 300);
      localStorage.removeItem('accessTab');
    }
  }, []);

  // 🔌 GET /api/requests/pending → obtener solicitudes pendientes
  useEffect(() => {
    const fetchPendingRequests = async () => {
      const token = await getAccessTokenSilently();
      try {
        const res = await fetch('http://localhost:8000/api/requests/pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setPending(data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, []);

  // 🔌 POST /api/requests/resolve → enviar decisión tomada
  const handleDecision = async (index: number, status: 'Approved' | 'Rejected') => {
    const user = pending[index];
    const decision: HistoryItem = {
      ...user,
      status,
      decidedBy: currentUser,
    };

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('http://localhost:8000/api/requests/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(decision),
      });

      if (!res.ok) throw new Error('Failed to resolve request');

      if (status === 'Approved') setApproved(prev => [...prev, decision]);
      else setRejected(prev => [...prev, decision]);

      setPending(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error sending decision:', error);
    }
  };

  return (
    <main className="panel">
      <h1 className="panel__title">Access Requests</h1>

      <div ref={tableRef}>
        <div className="tx__wrap">
          <div className="tx__tabs">
            <button className={activeTab === 'Pending' ? 'tx__tab active' : 'tx__tab'} onClick={() => setActiveTab('Pending')}>📁 Pending</button>
            <button className={activeTab === 'Approved' ? 'tx__tab active' : 'tx__tab'} onClick={() => setActiveTab('Approved')}>✔ Approved</button>
            <button className={activeTab === 'Rejected' ? 'tx__tab active' : 'tx__tab'} onClick={() => setActiveTab('Rejected')}>✖ Rejected</button>
          </div>

          <table className="tx__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Decided by</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'Pending' &&
                pending.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div className="tx__name">{user.name}</div>
                      <div className="tx__alias">{user.alias}</div>
                    </td>
                    <td><div className="tx__email">{user.email}</div></td>
                    <td><span className="tx__pill pending">Pending</span></td>
                    <td><span className="tx__badge">—</span></td>
                    <td>
                      <div className="tx__actions">
                        <button className="tx__actionBtn approve" onClick={() => handleDecision(index, 'Approved')}>✔ Approve</button>
                        <button className="tx__actionBtn reject" onClick={() => handleDecision(index, 'Rejected')}>✖ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}

              {activeTab === 'Approved' &&
                approved.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="tx__name">{item.name}</div>
                      <div className="tx__alias">{item.alias}</div>
                    </td>
                    <td><div className="tx__email">{item.email}</div></td>
                    <td><span className="tx__pill approved">Approved</span></td>
                    <td><span className="tx__badge">{item.decidedBy}</span></td>
                    <td>—</td>
                  </tr>
                ))}

              {activeTab === 'Rejected' &&
                rejected.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="tx__name">{item.name}</div>
                      <div className="tx__alias">{item.alias}</div>
                    </td>
                    <td><div className="tx__email">{item.email}</div></td>
                    <td><span className="tx__pill rejected">Rejected</span></td>
                    <td><span className="tx__badge">{item.decidedBy}</span></td>
                    <td>—</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
