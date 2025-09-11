import Header from '../components/Header';

export default function Home() {
  const isLoggedIn = true;
  const marketOpen = false;
  const totalAmount = 100;

  return (
    <main>
      <Header
        isLoggedIn={isLoggedIn}
        marketOpen={marketOpen}
        totalAmount={totalAmount}
      />
      <h1>Estoy en la pagina principal</h1>
    </main>
  );
}
