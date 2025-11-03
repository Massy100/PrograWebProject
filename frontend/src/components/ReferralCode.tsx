'use client';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FiClipboard, FiShare2 } from 'react-icons/fi';
import '../styles/Referral.css';

export default function ReferralCard() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [referralCode, setReferralCode] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<string>('$5'); 
  const [copied, setCopied] = useState(false);

  const appName = "Stocks";
  const appLink = "https://stocks.com/signup";


  useEffect(() => {
    async function fetchReferralData() {
      if (!isAuthenticated || !user) return;

      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/referrals/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReferralCode(data.referralCode || '');
          setRewardAmount('$5'); 
        } else {
          console.error('Error al obtener el código de referido');
        }
      } catch (error) {
        console.error('Error al comunicarse con el backend:', error);
      }
    }

    fetchReferralData();
  }, [isAuthenticated, user, getAccessTokenSilently]);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };


  const shareLink = () => {
    const message = `Hi there! \n\n` +
                `I’m inviting you to join ${appName} and enjoy exclusive benefits.\n\n` +
                `Referral code: ${referralCode}\n\n` +
                `Sign up here: ${appLink}\n\n` +
                `Don’t miss this opportunity!`;

    if (navigator.share) {
      navigator.share({
        title: `Únete a ${appName}`,
        text: message,
      }).catch(() => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="referral-container">
      <div className="referral-card">
        <h1 className="referral-title">Refer and earn!</h1>

        <p className="referral-description">
          Earn<span className="highlight">{rewardAmount}</span> when your referral joins and completes the registration through their account
        </p>

        <div className="referral-box">
          <p className="referral-label">Your referral code</p>
          <div className="referral-code-box">
            <span className="referral-code">{referralCode || 'Loading...'}</span>
            <button className="referral-copy" onClick={copyToClipboard} title="Copiar código">
              <FiClipboard size={20} />
            </button>
          </div>
          {copied && <p className="referral-copied">Copied!</p>}
        </div>

        <div className="referral-actions">
          <button className="referral-share" onClick={shareLink} disabled={!referralCode}>
            <FiShare2 size={18} /> Share
          </button>
        </div>

        <div className="referral-note">
          <p>This code can only be used once.</p>
        </div>
      </div>
    </div>
  );
}
