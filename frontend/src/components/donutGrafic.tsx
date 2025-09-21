'use client';
import '../styles/donutGrafic.css';

type Slice = { label: string; value: number };

export default function Donut({
  title = 'Invested vs Earned',
  data,
}: {
  title?: string;
  data: Slice[];
}) {
  const total = data.reduce((a, b) => a + (b.value || 0), 0) || 1;
  const perc = data.map((d) => (d.value / total) * 100);

  // colores: azul = invertido, verde = ganado
  const colors = ['#1b2029', '#1ac963'];

  // construimos el conic-gradient
  let accum = 0;
  const stops = perc
    .map((p, i) => {
      const start = accum;
      accum += p;
      return `${colors[i % colors.length]} ${start}% ${accum}%`;
    })
    .join(', ');

  return (
    <section className="donutCard">
      <header className="donutHead">{title}</header>
      <div className="donutWrap">
        <div
          className="donut"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="donutHole">
            {Math.round((perc[1] || 0))}%{/* % de lo ganado */}
          </div>
        </div>
        <ul className="donutLegend">
          {data.map((d, i) => (
            <li key={i}>
              <span
                className="dot"
                style={{ background: colors[i % colors.length] }}
              />
              {d.label} — {d.value}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
