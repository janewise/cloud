// export default Airtask;
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import "../../../components/TaskCard/taskcard";

interface AironeProps {
  userId: string | null;
  balanceRef: React.MutableRefObject<{ value: number }>;
  onRewardClaimed: () => void;
}

const Airone: React.FC<AironeProps> = ({
  userId,
  balanceRef,
  onRewardClaimed,
}) => {
  const [taskState, setTaskState] = useState<
    "go" | "check" | "countdown" | "claim" | "done"
  >("go");
  const [countdown, setCountdown] = useState(20);
  const [clickUpgradeLevel, setClickUpgradeLevel] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const Airreward = 100000; // Reward values

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const upgradesRef = ref(db, `users/${userId}/upgrades/clickUpgrade`);

      onValue(upgradesRef, (snapshot) => {
        const level = snapshot.val() || 0;
        setClickUpgradeLevel(level);
      });
    }
  }, [userId]);

  useEffect(() => {
    const savedState = localStorage.getItem("airTaskState");
    if (savedState === "done") {
      setTaskState("done");
    } else {
      setTaskState("go");
    }
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      if (taskState === "done") {
        localStorage.setItem("airTaskState", taskState);
      } else {
        localStorage.removeItem("airTaskState");
      }
    }
  }, [taskState, initialLoad]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (taskState === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (taskState === "countdown" && countdown === 0) {
      setTaskState("claim");
    }
    return () => clearTimeout(timer);
  }, [taskState, countdown]);

  const handleGoClick = () => {
    setTaskState("check");
  };

  const handleCheckClick = () => {
    setTaskState("countdown");
  };

  const handleClaimClick = () => {
    // Add reward to balance
    balanceRef.current.value += Airreward; // Assuming Airreward[0] is the reward for the task
    onRewardClaimed(); // Notify parent that reward was claimed
    setTaskState("done");
  };

  const renderButton = () => {
    if (taskState === "done") {
      return (
        <button className="taskdone" disabled>
          ✔️
        </button>
      );
    } else if (clickUpgradeLevel === 19) {
      switch (taskState) {
        case "go":
          return (
            <button className="taskgo" onClick={handleGoClick}>
              Go
            </button>
          );
        case "check":
          return (
            <button className="taskcheck" onClick={handleCheckClick}>
              Check
            </button>
          );
        case "countdown":
          return (
            <button className="taskcount" disabled>
              {countdown}s
            </button>
          );
        case "claim":
          return (
            <button className="taskclaim" onClick={handleClaimClick}>
              Claim
            </button>
          );
        default:
          return null;
      }
    } else {
      return (
        <button className="taskgo" disabled>
          Go
        </button>
      );
    }
  };

  return (
    <div className="task-box">
      <span className="taskspan">
        <p className="taskp">
          <span>Need to upgrade Tapbooster to level 19 (100K)</span>
          <span>{renderButton()}</span>
        </p>
      </span>
    </div>
  );
};

export default Airone;
