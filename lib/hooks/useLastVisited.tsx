import { useState, useEffect } from "react";

const animRefreshMins = 10;

export function useLastVisited(pathname: string) {
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    setIsEvaluated(false);
    if (!isEvaluated) {
      const calculateDiffInMinutes = (date1: Date, date2: Date) => {
        const diffInMs = Math.abs(date1.getTime() - date2.getTime());
        return Math.floor((diffInMs / (1000 * 60)) % 60);
      };

      const lastVisitedTimeString = localStorage.getItem(
        `lastVisited_${pathname}`
      );

      if (!lastVisitedTimeString) {
        setIsEvaluated(true);
        setAnimReady(true);
      }

      console.log(lastVisitedTimeString);

      if (
        lastVisitedTimeString &&
        calculateDiffInMinutes(new Date(), new Date(lastVisitedTimeString)) >=
        animRefreshMins
      ) {
        setAnimReady(true);
        localStorage.setItem(`lastVisited_${pathname}`, new Date().toString());
      } else {
        localStorage.setItem(`lastVisited_${pathname}`, new Date().toString());
      }

      setIsEvaluated(true);
    }
  }, [pathname]);

  return {
    animReady,
    isEvaluated,
  };
}
