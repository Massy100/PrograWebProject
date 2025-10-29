import { useEffect, useState } from "react";


const OPEN_HOUR = 7;   
const OPEN_MIN = 0;
const CLOSE_HOUR = 17;  
const CLOSE_MIN = 0;

export function useMarketStatus() {
  const [marketOpen, setMarketOpen] = useState(false);

  const checkMarketStatus = () => {
    const now = new Date();
    const gtTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Guatemala" }));

    const hour = gtTime.getHours();
    const minute = gtTime.getMinutes();

    const minutesNow = hour * 60 + minute;
    const minutesOpen = OPEN_HOUR * 60 + OPEN_MIN;
    const minutesClose = CLOSE_HOUR * 60 + CLOSE_MIN;

    const isWeekday = gtTime.getDay() >= 1 && gtTime.getDay() <= 5;
    const isOpen = isWeekday && minutesNow >= minutesOpen && minutesNow <= minutesClose;

    setMarketOpen(isOpen);
  };

  useEffect(() => {
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  return marketOpen;
}
