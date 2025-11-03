'use client';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useRef } from 'react';
import './access.css';

type UserRequest = {
  id: number;
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
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTab = localStorage.getItem('accessTab');
    if (savedTab === 'Pending') {
      setActiveTab('Pending');
      setTimeout(() => {
        const target = document.querySelector('.tx__wrap');
        if (target) {
            const offset = target.getBoundingClientRect().top + window.scrollY - 80; 
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
        }, 300);
      localStorage.removeItem('accessTab');
    }
  }, []);

  const fetchPendingRequests = async () => {
    const token = await getAccessTokenSilently();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/admin-requests/pending/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.user.full_name,
        alias: item.user.username,
        email: item.user.email,
      }));

      setPending(formattedData);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchApprovalHistory = async () => {
    const token = await getAccessTokenSilently();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/admin-requests/approved/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const formattedData = data.map((item: any) => ({
        name: item.user.full_name,
        alias: item.user.username,
        email: item.user.email,
        status: 'Approved' as 'Approved',
        decidedBy: item.reviewer.full_name,
      }));
      
      setApproved(formattedData);
    } catch (error) {
      console.error('Error fetching approval history:', error);
    }
  };

  const fetchRejectionHistory = async () => {
    const token = await getAccessTokenSilently();
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/admin-requests/rejected/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const formattedData = data.map((item: any) => ({
        name: item.user.full_name,
        alias: item.user.username,
        email: item.user.email,
        status: 'Rejected' as 'Rejected',
        decidedBy: item.reviewer.full_name,
      }));
      
      setRejected(formattedData);
    } catch (error) {
      console.error('Error fetching rejection history:', error);
    }
  };

  useEffect(() => {

    fetchPendingRequests();
    fetchApprovalHistory();
    fetchRejectionHistory();
  }, []);

  const handleDecision = async (index: number, status: 'Approved' | 'Rejected') => {
    const authData = localStorage.getItem('auth');
    if (!authData) {
      console.error('No reviewer ID found in localStorage');
      return;
    }

    const parsedAuth = JSON.parse(authData);
    const reviewerId = parsedAuth.id;
    const reviewerName = parsedAuth.name;

    const user = pending[index];
    const decision: HistoryItem = {
      ...user,
      status,
      decidedBy: reviewerName,
    };
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const urlByStatus = status === 'Approved' ? '/approve/' : '/reject/';
    const completeUrl = baseUrl + '/users/admin-requests' + urlByStatus + `?id=${index}`;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(completeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({reviewer_id: reviewerId}),
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
            <button className={activeTab === 'Pending' ? 'tx__tab active' : 'tx__tab'} onClick={() => setActiveTab('Pending')}>Pending</button>
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
                pending.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="tx__name">{req.name}</div>
                      <div className="tx__alias">{req.alias}</div>
                    </td>
                    <td><div className="tx__email">{req.email}</div></td>
                    <td><span className="tx__pill pending">Pending</span></td>
                    <td><span className="tx__badge">—</span></td>
                    <td>
                      <div className="tx__actions">
                        <button className="tx__actionBtn approve" onClick={() => handleDecision(req.id, 'Approved')}>✔ Approve</button>
                        <button className="tx__actionBtn reject" onClick={() => handleDecision(req.id, 'Rejected')}>✖ Reject</button>
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
