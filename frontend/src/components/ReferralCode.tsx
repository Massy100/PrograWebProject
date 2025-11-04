'use client';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FiClipboard, FiShare2 } from 'react-icons/fi';
import '../styles/Referral.css';

interface ReferralData {
  referralCode: string;
  referralsCount?: number;
  expiresAt?: string;
  created?: boolean;
}

export default function ReferralCard() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appName = "Finova";
  const appLink = "https://stocks.com/signup";
  const rewardAmount = "$5";

  useEffect(() => {
    async function fetchReferralData() {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/referrals/create/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Error fetching referral data');
        }

        const data = await response.json();
        setReferralData(data);
      } catch (error: any) {
        console.error('❌ Error fetching referral:', error);
        setError('Could not load your referral code');
      } finally {
        setLoading(false);
      }
    }

    fetchReferralData();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const copyToClipboard = () => {
    if (!referralData?.referralCode) return;
    navigator.clipboard.writeText(referralData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="referral-container">
      <div className="referral-card">
        {loading ? (
          <div className="referral-loading">
            <div className="spinner"></div>
            <p>Loading your referral info...</p>
          </div>
        ) : error ? (
          <div className="referral-error">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h1 className="referral-title">Refer and Earn!</h1>

            <p className="referral-description">
              Earn <span className="highlight">{rewardAmount}</span> when your friend joins and completes registration.
            </p>

            <div className="referral-box">
              <p className="referral-label">Your Referral Code</p>
              <div className="referral-code-box">
                <span className="referral-code">{referralData?.referralCode || '—'}</span>
                <button className="referral-copy" onClick={copyToClipboard} title="Copy code">
                  <FiClipboard size={20} />
                </button>
              </div>
              {copied && <p className="referral-copied">Copied!</p>}
            </div>

            {referralData?.referralsCount !== undefined && (
              <p className="referral-stats">
                You have invited <strong>{referralData.referralsCount}</strong> friends 🎉
              </p>
            )}

            <div className="referral-note">
              <p>
                This code expires on{' '}
                {referralData?.expiresAt
                  ? new Date(referralData.expiresAt).toLocaleDateString()
                  : '—'}
                .
              </p>
              <p>Each referral can use it once.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
