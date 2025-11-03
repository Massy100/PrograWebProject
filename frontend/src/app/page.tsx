'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import SearchResults from '@/components/searchResults';
import OptionsUser from '@/components/navUsers';    
import SidebarOptions from '@/components/navAdmin';   
import CompleteUserRegister from '@/components/CompleteUserRegister';
import Wallet from '@/components/wallet';
import StocksRecommendationsTable, { StockItem } from '@/components/stocksTable';
import PopularStocksCard, { PopularStock } from '@/components/popularCardStocks';
import Footer from '@/components/Footer';
import '@/app/page.css';

export default function FinovaHome() {
  const router = useRouter();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [completeRegisterOpen, setCompleteRegisterOpen] = useState(false);

  const [realStocks, setRealStocks] = useState<StockItem[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  const generateLastDays = (currentPrice: number, variationPct: number): number[] => {
    const days = 30;
    const data: number[] = [];
    const volatility = Math.abs(variationPct) / 2 + 0.5;
    let price = currentPrice;

    for (let i = days - 1; i >= 0; i--) {
      const randomChange = 1 + (Math.random() - 0.5) * (volatility / 100);
      price = Math.max(price * randomChange, 0.1);
      data.unshift(parseFloat(price.toFixed(2)));
    }
    return data;
  };

  const fetchActiveStocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks/active/`);
      if (!res.ok) throw new Error("Failed to fetch active stocks");
      const data = await res.json();

      const parsed: StockItem[] = data.map((s: any) => {
        const variation = parseFloat(s.variation ?? 0);
        const price = parseFloat(s.last_price ?? 0);
        const last30d = generateLastDays(price, variation);

        let recommendation = "HOLD";
        if (variation > 5) recommendation = "STRONG BUY";
        else if (variation > 2) recommendation = "BUY";
        else if (variation < -5) recommendation = "STRONG SELL";
        else if (variation < -2) recommendation = "SELL";

        const avg = last30d.reduce((a, b) => a + b, 0) / last30d.length;
        const targetPrice = parseFloat((avg * 1.05).toFixed(2));

        return {
          symbol: s.symbol,
          name: s.name || s.symbol,
          currentPrice: price,
          changePct: variation,
          last30d,
          targetPrice,
          recommendation,
        };
      });

      setRealStocks(parsed);
      const popular: PopularStock[] = parsed.slice(0, 7).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.currentPrice,
        changePct: s.changePct,
      }));
      setPopularStocks(popular);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setRealStocks(getDemoStocks());
      setPopularStocks(getDemoStocks().slice(0, 7).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.currentPrice,
        changePct: s.changePct,
      })));
    } finally {
      setLoading(false);
    }
  };

  const getDemoStocks = (): StockItem[] => [
    {
      symbol: 'AAPL',
      name: 'Apple Inc',
      currentPrice: 270.37,
      changePct: 0.83,
      last30d: generateLastDays(270.37, 0.83),
      targetPrice: 285.00,
      recommendation: 'BUY',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp',
      currentPrice: 520.45,
      changePct: 1.25,
      last30d: generateLastDays(520.45, 1.25),
      targetPrice: 545.00,
      recommendation: 'STRONG BUY',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      currentPrice: 250.75,
      changePct: -2.05,
      last30d: generateLastDays(250.75, -2.05),
      targetPrice: 265.00,
      recommendation: 'HOLD',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc',
      currentPrice: 180.12,
      changePct: 0.45,
      last30d: generateLastDays(180.12, 0.45),
      targetPrice: 190.00,
      recommendation: 'BUY',
    },
  ];

  useEffect(() => {
    fetchActiveStocks();
    const interval = setInterval(fetchActiveStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const [walletOpen, setWalletOpen] = useState(false);
  const { user, getAccessTokenSilently } = useAuth0();
  const [verifiedUser, setVerifiedUser] = useState(false);
  const [completedUser, setCompletedUser] = useState(false);
  const [role, setRole] = useState<"admin" | "client">("client");
  const [load, setLoad] = useState(true);

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync/`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!data) throw new Error("No backend response.");
      const dbUser = data.user;

      localStorage.setItem("auth", JSON.stringify({
        id: dbUser.id, 
        verified: dbUser.verified, 
        role: dbUser.user_type, 
        completed: dbUser.is_completed
      }));

      document.cookie = `auth=${encodeURIComponent(JSON.stringify({
        role: dbUser.user_type,
        verified: dbUser.verified,
        completed: dbUser.is_completed
      }))}; path=/; max-age=86400; samesite=lax`;

      setVerifiedUser(dbUser.verified);
      setCompletedUser(dbUser.is_completed);
      setRole(dbUser.user_type);
      setLoad(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) callApi();
  }, [user, isAuthenticated]);

  return (
    <>
      <SearchResults
        headerProps={{ marketOpen: true, totalAmount: 100, isLoggedIn: false }}
        title="Search Results"
        alwaysShowHeader={true} 
      />

      {role === 'client' && verifiedUser && (
        <OptionsUser onOpenWallet={() => setWalletOpen(true)} />
      )}

      {role === 'admin' && <SidebarOptions />}

      <Wallet open={walletOpen} onClose={() => setWalletOpen(false)} />

      {completeRegisterOpen && (
        <CompleteUserRegister 
          onClose={() => setCompleteRegisterOpen(false)} 
          onSuccess={() => setCompletedUser(true)}
        />
      )}
      
      <main className="landingPage">
        <section className="div-initial">
          <div className="info">
            <h1 className="home-title">Welcome to Finova</h1>
            <p className="home-text">
              {loading 
                ? 'Loading real-time financial data powered by Finova...' 
                : 'Empowering you with data-driven insights and smarter investment decisions.'}
            </p>
            {loading && <div className="loading-indicator"><span>Loading live stock data...</span></div>}

            {!isAuthenticated && (
              <button type="button" className="see-more-btn" onClick={() => loginWithRedirect()}>
                Login
              </button>
            )}

            <div className='log-buttons'>
              {isAuthenticated && !completedUser && !load &&(
                <button
                  type="button"
                  className="see-more-btn"
                  onClick={() => setCompleteRegisterOpen(true)}
                >
                  Complete registration
                </button>
              )}

              {isAuthenticated && completedUser && !verifiedUser && !load && (
                <p>Your access request has been successfully sent to the Finova administration team.
                   You’ll receive an email confirmation once your account is verified.</p>
              )}

              {isAuthenticated && !verifiedUser && !load && (
                <button
                  type="button"
                  className="see-more-btn"
                  onClick={() => {logout(); localStorage.clear()}}
                >
                  Logout
                </button>
              )}
            </div>
          </div>


          <div className="stocks-card">
            <PopularStocksCard 
              items={popularStocks.length > 0 ? popularStocks : getDemoStocks().slice(0, 7).map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.currentPrice,
                changePct: stock.changePct,
              }))} 
              loading={loading}
            />
          </div>
        </section>
            
        <section className="section-container">
          <h2 className="section-title">How Finova Works</h2>
          <p className="section-text">
            Finova stands at the intersection of <strong>finance</strong> and <strong>innovation</strong>.  
            Our mission is to make the financial world more transparent, intelligent, and accessible for everyone.  
            <br /><br />
            With Finova, you can create your account in minutes, fund your digital wallet securely,
            and start exploring real-time stock data.
            <br /><br />
            We combine advanced analytics with a clean, intuitive interface so that whether you're a beginner
            or an experienced trader, you always have access to the tools that empower smart decisions.
            <br /><br />
            Welcome to the future of investing. Welcome to <strong>Finova</strong>.
          </p>
        </section>

        <StocksRecommendationsTable 
          rows={realStocks.length > 0 ? realStocks : getDemoStocks()} 
          loading={loading}
        />

        <section className="div-initial div-reverse">
          <div className="stocks-card">
            <PopularStocksCard 
              items={popularStocks.length > 0 ? popularStocks : getDemoStocks().slice(0, 7).map(stock => ({
                symbol: stock.symbol,
                name: stock.name,
                price: stock.currentPrice,
                changePct: stock.changePct,
              }))} 
              loading={loading}
            />
          </div>

          <div className="info">
            <h1 className="section-title">Market Insights</h1>
            <p className="home-text">
              Discover the trends that shape the markets. Finova helps you spot opportunities,
              understand market momentum, and make informed moves that drive your portfolio forward.
            </p>
          </div>
        </section>

        
      </main>
    </>
  );
}
