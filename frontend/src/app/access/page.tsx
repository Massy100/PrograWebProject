'use client';

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

export default function Home() {
  const [pending, setPending] = useState<UserRequest[]>([]);
  const [approved, setApproved] = useState<HistoryItem[]>([]);
  const [rejected, setRejected] = useState<HistoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('Josué');
  const [showTables, setShowTables] = useState(false);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const simulatedRequests = [
      { name: 'Grecia López', alias: '@grecia', email: 'grecia@example.com' },
      { name: 'Juan Pérez', alias: '@juan', email: 'juan@example.com' },
    ];
    setPending(simulatedRequests);
  }, []);

  const handleDecision = (index: number, status: 'Approved' | 'Rejected') => {
    const user = pending[index];
    const decision: HistoryItem = {
      ...user,
      status,
      decidedBy: currentUser,
    };

    if (status === 'Approved') setApproved(prev => [...prev, decision]);
    else setRejected(prev => [...prev, decision]);

    setPending(prev => prev.filter((_, i) => i !== index));
  };

  const revealTables = () => {
    setShowTables(true);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <main className="panel">
      <h1 className="panel__title">User Access Management</h1>

      {!showTables && pending.length > 0 && (
        <div className="alertContainer">
            <button className="alertBtn full" onClick={revealTables}>
            View pending requests 
            </button>
        </div>
        )}


      {showTables && (
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
      )}
    </main>
  );
}
