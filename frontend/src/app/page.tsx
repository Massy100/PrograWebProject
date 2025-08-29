export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ping/`, {
    cache: "no-store",
  });
  const data = await res.json();
  return (
    <main style={{ padding: 24 }}>
      <h1>Conexión Front ↔ Back</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
