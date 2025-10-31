'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/AdminTransactionsTable.css';

type TxType = 'buy' | 'sell';

type TxRow = {
  code?: string | null;
  user: string;
  stock?: string;
  transaction_type: TxType;
  total_amount: number | string;
  created_at: string | Date;
  is_active: boolean;
  quantity?: number;
  unit_price?: number | string;
};

export default function AdminTransactionsTable({ rows }: { rows: TxRow[] }) {
  const router = useRouter();
  const [selectedTx, setSelectedTx] = useState<TxRow | null>(null);

  return (
    <section className="tx__wrap">
      <table className="tx__table">
        <colgroup>
          <col /> {/* Type */}
          <col /> {/* User */}
          <col /> {/* Asset */}
          <col /> {/* Date */}
          <col /> {/* Quantity */}
          <col /> {/* Unit Price */}
          <col /> {/* Total */}
          <col /> {/* Status */}
        </colgroup>

        <thead>
          <tr>
            <th>Tipo</th>
            <th>Activo</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => {
            const pill = r.transaction_type === 'sell' ? 'S' : 'B';
            const pillClass = r.transaction_type === 'sell' ? 'is-sell' : 'is-buy';
            const gain = Number(r.total_amount) >= 0;

            const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedTx(r);
              }
            };

            return (
              <tr
                key={i}
                className="row-clickable"
                role="link"
                tabIndex={0}
                aria-label={`Abrir transacción ${r.code ?? i}`}
                onClick={() => setSelectedTx(r)}
                onKeyDown={onKeyDown}
              >
                <td>
                  <span className={`tx__pill ${pillClass}`}>{pill}</span>
                </td>

                <td className="td-action-name">
                  <div className="tx__asset">
                    {r.stock && <div className="tx__assetTitle" title={r.stock}>{r.stock}</div>}
                    {r.code && <div className="tx__assetCode" title={String(r.code)}>{r.code}</div>}
                  </div>
                </td>

                <td>{r.user}</td>

                <td>
                  {new Date(r.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                <td>{r.quantity ?? '—'}</td>
                <td>Q.{r.unit_price != null ? r.unit_price : '—'}</td>
                <td className={gain ? 'is-gain' : 'is-loss'}>Q.{r.total_amount}</td>

                <td>
                  <i className={`tx__dot ${r.is_active ? 'ok' : 'off'}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedTx && (
        <div className="tx__modalOverlay" onClick={() => setSelectedTx(null)}>
          <div className="tx__modal" onClick={e => e.stopPropagation()}>
            <h2 className="tx__modalTitle">Detalle de transacción</h2>
            <div className="tx__modalContent">
              <p><strong>Tipo:</strong> {selectedTx.transaction_type}</p>
              <p><strong>Usuario:</strong> {selectedTx.user}</p>
              <p><strong>Activo:</strong> {selectedTx.stock ?? '—'}</p>
              <p><strong>Código:</strong> {selectedTx.code ?? '—'}</p>
              <p><strong>Fecha:</strong> {new Date(selectedTx.created_at).toLocaleDateString('es-ES')}</p>
              <p><strong>Cantidad:</strong> {selectedTx.quantity ?? '—'}</p>
              <p><strong>Precio Unitario:</strong> Q.{selectedTx.unit_price ?? '—'}</p>
              <p><strong>Total:</strong> Q.{selectedTx.total_amount}</p>
              <p><strong>Estado:</strong> {selectedTx.is_active ? 'Activo' : 'Inactivo'}</p>
            </div>
            <button className="tx__modalClose" onClick={() => setSelectedTx(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </section>
  );
}
