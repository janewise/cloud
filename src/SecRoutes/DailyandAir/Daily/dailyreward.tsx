import React, { useState, useEffect } from "react";
import "./Dailyreward.css";

interface DailyrewardProps {
  balanceRef: React.MutableRefObject<{ value: number }>;
  onRewardClaimed: () => void;
}

const random = Math.floor(Math.random() * (3000000 - 1000000 + 1)) + 1000000; // Generates a random number between 500 and 800
const dailyRewards = [
  1000,
  random,
  3000,
  5000,
  10000,
  50000,
  100000,
  200000,
  500000,
  1000000,
];

const Dailyreward: React.FC<DailyrewardProps> = ({
  balanceRef,
  onRewardClaimed,
}) => {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [claimableDay, setClaimableDay] = useState<number>(1);
  const [lastClaimTimestamp, setLastClaimTimestamp] = useState<number>(
    Date.now()
  );
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    const storedDay = localStorage.getItem("currentDay");
    const storedClaimableDay = localStorage.getItem("claimableDay");
    const storedTimestamp = localStorage.getItem("lastClaimTimestamp");
    const storedHasClaimed = localStorage.getItem("hasClaimed");

    if (
      storedDay &&
      storedTimestamp &&
      storedClaimableDay &&
      storedHasClaimed
    ) {
      const day = parseInt(storedDay, 10);
      const claimable = parseInt(storedClaimableDay, 10);
      const timestamp = parseInt(storedTimestamp, 10);
      const hasClaimed = storedHasClaimed === "true";

      const currentTime = Date.now();
      const timeDifference = currentTime - timestamp;

      console.log("Stored Day:", day);
      console.log("Stored Claimable Day:", claimable);
      console.log("Stored Timestamp:", timestamp);
      console.log("Current Time:", currentTime);
      console.log("Time Difference (minutes):", timeDifference / (60 * 1000));

      setCurrentDay(day);
      setClaimableDay(claimable);
      setLastClaimTimestamp(timestamp);
      setHasClaimed(hasClaimed);

      if (
        timeDifference > 24 * 60 * 60 * 1000 &&
        timeDifference <= 2 * 24 * 60 * 60 * 1000 &&
        hasClaimed
      ) {
        // 1 minute to 2 minutes
        const nextClaimableDay = claimable === 10 ? 1 : claimable + 1;
        setClaimableDay(nextClaimableDay);
        setHasClaimed(false);
        console.log(
          `Time difference exceeded 1 minute. Next claimable day: ${nextClaimableDay}`
        );
      } else if (timeDifference > 2 * 24 * 60 * 60 * 1000) {
        // 2 minutes
        setCurrentDay(1);
        setClaimableDay(1);
        setHasClaimed(false);
        console.log("Time difference exceeded 2 minutes. Reset to day 1.");
      }
    }

    setInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      localStorage.setItem("currentDay", currentDay.toString());
      localStorage.setItem("claimableDay", claimableDay.toString());
      localStorage.setItem("lastClaimTimestamp", lastClaimTimestamp.toString());
      localStorage.setItem("hasClaimed", hasClaimed.toString());
      console.log("Updated Current Day:", currentDay);
      console.log("Updated Claimable Day:", claimableDay);
      console.log("Updated Last Claim Timestamp:", lastClaimTimestamp);
      console.log("Updated Has Claimed:", hasClaimed);
    }
  }, [currentDay, claimableDay, lastClaimTimestamp, hasClaimed, initialLoad]);

  const handleClaimReward = (day: number) => {
    if (day !== claimableDay || hasClaimed || initialLoad) return;

    const reward = dailyRewards[day - 1];
    balanceRef.current.value += reward;
    onRewardClaimed();

    const nextDay = currentDay === 10 ? 1 : currentDay + 1;
    setCurrentDay(nextDay);
    const nextClaimableDay = nextDay;
    setClaimableDay(nextClaimableDay);
    setLastClaimTimestamp(Date.now());
    setHasClaimed(true);

    console.log(`Reward for Day ${day} claimed: ${reward} coins`);
    console.log("Next Current Day:", nextDay);
    console.log("Next Claimable Day:", nextClaimableDay);
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "10px",
    margin: "10px",
    cursor: "pointer",
    display: "inline-block",
    opacity: 0.5,
  };

  const activeCardStyle: React.CSSProperties = {
    ...cardStyle,
    opacity: 1,
  };

  return (
    <div>
      <h2>Daily Reward</h2>
      <div className="daily-reward-container">
        <div
          className={`card ${
            1 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(1)}
        >
          <h4>D-1</h4>
          <p>1000</p>
        </div>

        <div
          className={`card ${
            3 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(3)}
        >
          <h4>D-2</h4>
          <p>3000</p>
        </div>
        <div
          className={`card ${
            4 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(4)}
        >
          <h4>D-3</h4>
          <p>5000</p>
        </div>
        <div
          className={`card ${
            5 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(5)}
        >
          <h4>D-4</h4>
          <p>10000</p>
        </div>
        <div
          className={`card ${
            6 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(6)}
        >
          <h4>D-5</h4>
          <p>50000</p>
        </div>
        <div
          className={`card ${
            7 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(7)}
        >
          <h4>D-6</h4>
          <p>100K</p>
        </div>
        <div
          className={`card ${
            8 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(8)}
        >
          <h4>D - 7</h4>
          <p>200K</p>
        </div>
        <div
          className={`card ${
            9 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(9)}
        >
          <h4>D-8</h4>
          <p>500K</p>
        </div>
        <div
          className={`card ${
            10 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(10)}
        >
          <h4>D-9</h4>
          <p>1M</p>
        </div>
        <div
          className={`card ${
            2 === claimableDay && !hasClaimed && !initialLoad ? "active" : ""
          }`}
          onClick={() => handleClaimReward(2)}
        >
          <h4>Bonus</h4>
          <p>1M-3M</p>
        </div>
      </div>
    </div>
  );
};

export default Dailyreward;
