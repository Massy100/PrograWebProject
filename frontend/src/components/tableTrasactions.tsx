'use client';

import '../styles/tableTrasactions.css';

type TxType = 'buy' | 'sell';

type TxRow = {
  code?: string | null;
  stock?: string;
  transaction_type: TxType;
  total_amount: number | string;
  created_at: string | Date;
  is_active: boolean;
  quantity?: number;
  unit_price?: number | string;
};

export default function TransactionsTable({ rows }: { rows: TxRow[] }) {
  return (
    <section className="tx__wrap">
      {/* The colgroup ensures thead and tbody align 1:1 */}
      <table className="tx__table">
        <colgroup>
          <col /> {/* Type */}
          <col /> {/* Asset */}
          <col /> {/* Date */}
          <col /> {/* Quantity */}
          <col /> {/* Unit Price */}
          <col /> {/* Total */}
          <col /> {/* Status */}
        </colgroup>

        <thead>
          <tr>
            <th>Type</th>
            <th>Asset</th>
            <th>Date</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => {
            const pill = r.transaction_type === 'sell' ? 'S' : 'B';
            const pillClass = r.transaction_type === 'sell' ? 'is-sell' : 'is-buy';
            const gain = Number(r.total_amount) >= 0;

            return (
              <tr key={i} 
              >
                <td>
                  <span className={`tx__pill ${pillClass}`}>{pill}</span>
                </td>

                <td className='td-action-name'>
                  <div className="tx__asset">
                    {r.stock && (
                      <div className="tx__assetTitle" title={r.stock}>
                        {r.stock}
                      </div>
                    )}
                    {r.code && (
                      <div className="tx__assetCode" title={String(r.code)}>
                        {r.code}
                      </div>
                    )}
                  </div>
                </td>

                <td>
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                <td>{r.quantity ?? '—'}</td>
                <td>Q.{r.unit_price != null ? r.unit_price : '—'}</td>
                <td className={`${gain ? 'is-gain' : 'is-loss'}`}>Q.{r.total_amount}</td>

                <td>
                  <i className={`tx__dot ${r.is_active ? 'ok' : 'off'}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
