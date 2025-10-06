'use client';

import { useEffect, useState } from 'react';
import './access.css';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
};

type HistorialItem = {
  nombre: string;
  correo: string;
  estado: 'Aprobado' | 'Rechazado';
  por: string;
};

export default function Home() {
  const [pendientes, setPendientes] = useState<Usuario[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<string>('Josué');
  const [panelAbierto, setPanelAbierto] = useState(false);

  useEffect(() => {
    // Simulación de solicitudes
    const solicitudesSimuladas = [
      { id: 1, nombre: 'Ana López', correo: 'ana@example.com' },
      { id: 2, nombre: 'Carlos Méndez', correo: 'carlos@example.com' },
    ];
    setPendientes(solicitudesSimuladas);
  }, []);

  const aprobar = (id: number) => {
    const usuario = pendientes.find(u => u.id === id);
    if (!usuario) return;
    setHistorial(prev => [...prev, { ...usuario, estado: 'Aprobado', por: usuarioActual }]);
    setPendientes(prev => prev.filter(u => u.id !== id));
  };

  const rechazar = (id: number) => {
    const usuario = pendientes.find(u => u.id === id);
    if (!usuario) return;
    setHistorial(prev => [...prev, { ...usuario, estado: 'Rechazado', por: usuarioActual }]);
    setPendientes(prev => prev.filter(u => u.id !== id));
  };

  return (
    <main>
      <h1>Bienvenido, {usuarioActual}</h1>

      {pendientes.length > 0 && (
        <button className="notificacionBtn" onClick={() => setPanelAbierto(true)}>
          Ver solicitudes pendientes ({pendientes.length})
        </button>
      )}

      {panelAbierto && (
        <div className="solicitudes-panel">
          <button className="solicitudes-close" onClick={() => setPanelAbierto(false)}>✕</button>
          <h2>Solicitudes de usuarios</h2>

          {pendientes.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
          ) : (
            pendientes.map(usuario => (
              <div key={usuario.id} className="solicitud-card">
                <div>
                  <strong>{usuario.nombre}</strong>
                  <p>{usuario.correo}</p>
                </div>
                <div className="acciones">
                  <button className="btn-aprobar" onClick={() => aprobar(usuario.id)}>Aprobar</button>
                  <button className="btn-rechazar" onClick={() => rechazar(usuario.id)}>Rechazar</button>
                </div>
              </div>
            ))
          )}

          {historial.length > 0 && (
            <div className="solicitudes-historial">
              <h3>Historial</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.nombre}</td>
                      <td>{item.correo}</td>
                      <td>{item.estado}</td>
                      <td>{item.por}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
