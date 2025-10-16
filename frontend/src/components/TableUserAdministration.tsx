'use client';

import { useState, useEffect } from 'react';
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

const API_BASE_URL = 'http://localhost:8000'; 

export default function TableUserAdministration() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Obtener usuarios desde el backend de Django
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/users/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Si necesitas autenticación, agrega el token aquí:
            // 'Authorization': `Bearer ${token}`
          },
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data: UserRow[] = await res.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('An error occurred while fetching users.', err);
        setError('Error loading users data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const deactivateUser = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}/deactivate/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error('Error al desactivar usuario');
      }

      // Actualizar el estado local
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, is_active: false } : u))
      );
      
    } catch (err) {
      console.error('Error al desactivar usuario', err);
      alert('Error al desactivar el usuario');
    }
  };

  if (loading) {
    return (
      <div className="div-table-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="div-table-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

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
            const href = `/user-overview/${u.id}`;
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
                    onClick={() => deactivateUser(u.id)}
                    disabled={!u.is_active}
                  >
                    {u.is_active ? 'Deactivate' : 'Inactive'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="no-users">No users registered</div>
      )}
    </div>
  );
}