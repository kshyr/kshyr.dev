import { useState, useEffect } from "react";

const animRefreshMins = 10;

export function useLastVisited(pathname: string) {
  const [lastVisitedDiffMins, setLastVisitedDiffMins] = useState(0);

  useEffect(() => {
    const calculateDiffInMinutes = (date1: Date, date2: Date) => {
      const diffInMs = Math.abs(date1.getTime() - date2.getTime());
      return Math.floor((diffInMs / (1000 * 60)) % 60);
    };

    const lastVisitedTimeString = localStorage.getItem(
      `lastVisited_${pathname}`
    );

    if (lastVisitedTimeString) {
      const lastVisitedTime = new Date(lastVisitedTimeString);
      const currentTime = new Date();
      const diffMins = calculateDiffInMinutes(currentTime, lastVisitedTime);
      setLastVisitedDiffMins(diffMins);
    }

    localStorage.setItem(`lastVisited_${pathname}`, new Date().toString());
  }, [pathname]);

  return {
    lastVisitedDiffMins,
    animReady: true,
  };
}
