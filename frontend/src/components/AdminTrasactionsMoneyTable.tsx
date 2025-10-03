'use client';

import { useRouter } from 'next/navigation';
import '../styles/AdminTransactionsTable.css';

type TxType = 'moneyMovement';

type TxRow = {
  code?: string | null;
  user: string;
  bank: string;
  transaction_type: TxType;
  total_amount: number | string;
  created_at: string | Date;
};

const TYPE_PILL: Record<TxType, { text: string; cls: string; label: string }> = {
  moneyMovement: { text: '$', cls: 'is-money', label: 'Money Movement' },
};

export default function AdminTransactionsMoneyTable({ rows }: { rows: TxRow[] }) {
  const router = useRouter();

  return (
    <section className="tx__wrap">
      <table className="tx__table">
        <colgroup>
          <col /> {/* Type */}
          <col/>  {/* User*/}
          <col /> {/* Code */}
          <col/>  {/* Bank */}
          <col /> {/* Date */}
          <col /> {/* Total */}
        </colgroup>

        <thead>
          <tr>
            <th>Type</th>
            <th>User</th>
            <th>Code</th>
            <th>Bank</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        
        <tbody>
          {rows.map((r, i) => {
            const { text: pillText, cls: pillClass, label } = TYPE_PILL[r.transaction_type];
            const href = `/transactions/${r.code ?? i}`;

            const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(href);
              }
            };

            return (
              <tr
                key={i}
                className="row-clickable"
                role="link"
                tabIndex={0}
                aria-label={`Abrir transacción ${r.code ?? i}`}
                onClick={() => router.push(href)}
                onKeyDown={onKeyDown}
              >
                {/* Type */}
                <td>
                  <span className={`tx__pill ${pillClass}`} title={label}>
                    {pillText}
                  </span>
                  {/* Si querés mostrar el nombre literal también: */}
                  {/* <span className="tx__typeName">{r.transaction_type}</span> */}
                </td>

                <td>{r.user}</td>
                <td>{r.code ?? '—'}</td>
                <td>{r.bank}</td>

                <td>
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                <td>Q.{r.total_amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
