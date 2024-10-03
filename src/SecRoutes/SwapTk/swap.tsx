// export default Exchange;
import React, { useState, useEffect } from "react";
import { sendExchangeAmountToFirebase } from "../../firebaseFunctions"; // Import your Firebase function
import "./swap.css";
//import { sendExchangeTokenToFirebase } from "../../firebaseFunctions";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { Snackbar } from "@mui/material";

interface ExchangeProps {
  autoIncrement: number;
  userId: string | null; // Add userId prop to identify the user in Firebase
}

//D4-01dow is for exchange mechanism
const Swap: React.FC<ExchangeProps> = ({ autoIncrement, userId }) => {
  const [inputValue, setInputValue] = useState<number>(0); // Start with 0
  const [error, setError] = useState<string | null>(null); // State for error message
  const [success, setSuccess] = useState<boolean>(false); // State for success feedback

  const exchangeRate = 1000;
  const maxExchangeValue = Math.floor(autoIncrement * 3600);

  const isClickable = inputValue > 0 && inputValue <= autoIncrement * 3600;

  const handlePlus = () => {
    const newValue = inputValue + exchangeRate;
    const maxExchangeValue = Math.floor(autoIncrement * 3600);
    const remainingValue = maxExchangeValue - newValue;

    console.log("Previous Value:", inputValue);
    console.log("New Value (before condition):", newValue);
    console.log("Max Exchange Value:", maxExchangeValue);
    console.log("Remaining Value after Increment:", remainingValue);

    // Only update if new value does not exceed the maximum and is a full increment
    if (newValue <= maxExchangeValue && remainingValue >= 0) {
      setInputValue(newValue);
      console.log("New inputValue set to:", newValue);
    } else {
      console.log(
        "Increment skipped as it would exceed max or fall short of a full increment."
      );
    }
  };

  const handleMinus = () => {
    setInputValue((prevValue) => Math.max(prevValue - exchangeRate, 0));
  };

  const handleMax = () => {
    // Calculate the maximum exchangeable value that is a multiple of the exchange rate
    const maxValidValue =
      Math.floor(maxExchangeValue / exchangeRate) * exchangeRate;
    setInputValue(maxValidValue);
  };

  const handleCancel = () => {
    setInputValue(0); // Reset input value to 0
  };

  //D4-02down is for visible
  const [clickUpgradeLevel, setClickUpgradeLevel] = useState<number>(0);
  const [upgradeLevels, setUpgradeLevels] = useState<number[]>([]);

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
  ////////
  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const upgradesRef = ref(db, `users/${userId}/upgrades`);

      onValue(upgradesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const levels = [
          data.autoClicker01 || 0,
          data.autoClicker02 || 0,
          data.autoClicker03 || 0,
          data.autoClicker04 || 0,
          data.autoClicker05 || 0,
          data.autoClicker06 || 0,
          data.autoClicker07 || 0,
          data.autoClicker08 || 0,
          data.autoClicker09 || 0,
          data.autoClicker10 || 0,
          data.refClicker01 || 0,
          data.refClicker02 || 0,
          data.refClicker03 || 0,
          data.refClicker04 || 0,
          data.refClicker05 || 0,
          data.refClicker06 || 0,
          data.refClicker07 || 0,
          data.refClicker08 || 0,
          data.refClicker09 || 0,
          data.refClicker10 || 0,
          data.refClicker11 || 0,
          data.refClicker12 || 0,
          data.refClicker13 || 0,
          data.refClicker14 || 0,
          data.adsClicker01 || 0,
          data.adsClicker02 || 0,
          data.adsClicker03 || 0,
          data.adsClicker04 || 0,
          data.adsClicker05 || 0,
          data.adsClicker06 || 0,
          data.adsClicker07 || 0,
          data.adsClicker08 || 0,
        ];
        setUpgradeLevels(levels);
      });
    }
  }, [userId]);

  const calculateTotalValue = (levels: number[]) => {
    return levels.reduce((acc, level) => acc + (level > 1 ? 1 : 0), 0);
  };
  const totalValue = calculateTotalValue(upgradeLevels);

  ////D4-03exchange token

  const handleExchange = () => {
    const tokens = Math.floor(inputValue / exchangeRate);

    if (inputValue > autoIncrement * 3600) {
      setError("Input value exceeds the current autoIncrement");
      return;
    }

    if (userId) {
      sendExchangeAmountToFirebase(userId, inputValue, tokens);
      setInputValue(0); // Reset the input after a successful exchange
      setSuccess(true); // Set success feedback
      setError(null); // Clear any previous error
    } else {
      setError("User ID is not available.");
    }
  };

  //D4-04 Token show
  const [totalTokens, settotalTokens] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      const exchangeRef = ref(db, `users/${userId}/exchanges/tokens`);

      const unsubscribe = onValue(exchangeRef, (snapshot) => {
        const tokens = snapshot.val();
        settotalTokens(tokens || 0);
        //  alert(`Exchange amount updated: ${tokens}`);
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [userId]);

  const inusdt = totalTokens * 0.5;
  return (
    <div className="swap">
      <div className="swapbalance">{Math.floor(autoIncrement * 3600)} /h</div>
      <h4>{exchangeRate} Profit/h ~ 1 Token</h4>
      <h4>Tokens ~ {totalTokens}</h4>
      <p>
        {totalTokens} * 0.5 ~ {inusdt} usdt
      </p>

      {/* Show a message if the user has not passed the airdrop */}
      {clickUpgradeLevel <= 3 && totalValue <= 1 && (
        <p className="update-message">
          To exchange MYG tokens, you must level up Tab Booster level 19 and 18
          Cards to level 5.
        </p>
      )}

      {clickUpgradeLevel > 3 && totalValue > 2 && (
        <div className="exchange">
          <div className="exbox1">
            <input
              className="exin1"
              type="text"
              value={inputValue.toFixed(1)}
              readOnly
            />
            <button
              className={`exin2 ${isClickable ? "clickable" : "unclickable"}`}
              onClick={handleMax}
            >
              Max
            </button>
          </div>
          {/*  */}
          <div className="exbox2">
            <button
              className={`exin3 ${
                inputValue > 0 ? "clickable" : "unclickable"
              }`}
              onClick={handleMinus}
              disabled={inputValue <= 0}
            >
              -
            </button>
            <button className="exin4" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className={`exin5 ${
                inputValue < autoIncrement * 3600 ? "clickable" : "unclickable"
              }`}
              onClick={handlePlus}
              disabled={inputValue >= autoIncrement * 3600}
            >
              +
            </button>
          </div>
          <button
            className={`exin6 ${isClickable ? "clickable" : "unclickable"}`}
            onClick={handleExchange}
            disabled={!isClickable}
          >
            Exchange
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && (
            <Snackbar
              open={success}
              autoHideDuration={3000}
              message="Exchange successful!"
              onClose={() => setSuccess(false)}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              ContentProps={{
                sx: { backgroundColor: "green", color: "white" },
              }}
            />
          )}
        </div>
      )}
      {/*  */}
    </div>
  );
};

export default Swap;
