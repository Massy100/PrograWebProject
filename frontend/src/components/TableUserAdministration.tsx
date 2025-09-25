'use client';

import { useState } from 'react';
import '../styles/TableUserAdministration.css';

type UserRow = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  created_at: string;
  user_type: 'client' | 'admin';
  is_active: boolean;
  balance_available: number;
  balance_blocked: number;
};

const staticUsers: UserRow[] = [
  {
    id: 1,
    username: 'grecia',
    full_name: 'Grecia López',
    email: 'grecia@example.com',
    created_at: '2025-09-22T10:00:00Z',
    user_type: 'client',
    is_active: true,
    balance_available: 1500.25,
    balance_blocked: 200.0,
  },
  {
    id: 2,
    username: 'juan',
    full_name: 'Juan Pérez',
    email: 'juan@example.com',
    created_at: '2025-09-10T15:30:00Z',
    user_type: 'admin',
    is_active: false,
    balance_available: 0,
    balance_blocked: 0,
  },
  {
    id: 3,
    username: 'maria',
    full_name: 'María Ruiz',
    email: 'maria@example.com',
    created_at: '2025-08-05T09:12:00Z',
    user_type: 'client',
    is_active: true,
    balance_available: 980.0,
    balance_blocked: 120.5,
  },
];

export default function TableUserAdministration() {
  const [users, setUsers] = useState(staticUsers);

  const deactivate = (id: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, is_active: false } : u))
    );
  };

 
  return (
    <div className="div-table-container">
      <table className="div-table">
        <thead>
          <tr>
            <th className="div-table-header">ID</th>
            <th className="div-table-header">Name</th>
            <th className="div-table-header">Created Date</th>
            <th className="div-table-header">Email</th>
            <th className="div-table-header">Balance Available</th>
            <th className="div-table-header">Balance Blocked</th>
            <th className="div-table-header">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const href = `/users/${u.id}`;
            return (
              <tr key={u.id}>
                <td className="div-table-cell">
                  <a href={href} className="div-a userId">{u.id}</a>
                </td>
                <td className="div-table-cell">
                  <a href={href} className="div-a">
                    <div className="div-user-name">{u.full_name}</div>
                    <div className="div-user-username">@{u.username}</div>
                  </a>
                </td>
                <td className="div-table-cell">
                  <a href={href} className="div-a">
                    {new Date(u.created_at).toLocaleDateString()}
                  </a>
                </td>
                <td className="div-table-cell">
                  <a href={href} className="div-a">{u.email}</a>
                </td>
                <td className="div-table-cell">
                  <a href={href} className="div-a">
                    Q.{u.balance_available}
                  </a>
                </td>
                <td className="div-table-cell">
                  <a href={href} className="div-a">
                    Q.{u.balance_blocked}
                  </a>
                </td>
                <td className="div-table-cell">
                  <button
                    className="div-button-deactivate"
                    onClick={() => deactivate(u.id)}
                    disabled={!u.is_active}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
