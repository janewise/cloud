import React, { useRef, useEffect, useReducer, useState } from "react";
//for ts
import UpgradeState from "../classes/upgradeState";
import UpgradeEnergy from "../classes/upgradeEnergy";
//
import { ShareBal } from "../components/ShareBalance/sharebalance";
import AdsCard from "../components/Cards/AdsCard";
import { SaveGame } from "../components/saveGame";
//for booster
//firebase
import {
  sendUserDataToFirebase,
  updateUserAutoIncrementInFirebase,
} from "../firebaseFunctions";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
//countdown

export function Adsmine() {
  const balanceRef = useRef({ value: 0 });
  const forceUpdate = useReducer((x) => x + 1, 0)[1];

  const [energy, setEnergy] = useState(10000);
  const [maxEnergy, setMaxEnergy] = useState(10000);
  const [refillRate, setRefillRate] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  //user
  const [userId, setUserId] = useState<string | null>(null);
  //D4
  const [localTotalExchange, setLocalTotalExchange] = useState<number>(0); // Local version of totalExchange
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag to check if initial load is done

  // Load state from localStorage on mount For energy and autoincrement on window close
  useEffect(() => {
    const storedEnergy = localStorage.getItem("energy");
    const storedMaxEnergy = localStorage.getItem("maxEnergy");
    const storedRefillRate = localStorage.getItem("refillRate");
    const storedLastUpdated = localStorage.getItem("lastUpdated");
    //down is for autoincrement
    const storedBalance = localStorage.getItem("balance");
    const storedAutoIncrement = localStorage.getItem("autoIncrement");
    //D4
    const storedLocalTotalExchange = localStorage.getItem("localTotalExchange"); // Load local totalExchange

    if (
      storedEnergy &&
      storedMaxEnergy &&
      storedRefillRate &&
      storedLastUpdated &&
      storedBalance &&
      storedAutoIncrement
    ) {
      const timePassed = (Date.now() - parseInt(storedLastUpdated, 10)) / 1000; // time in seconds
      console.log("timePassed (seconds):", timePassed);

      const storedRefillRateNum = parseInt(storedRefillRate, 10);
      const calculatedEnergy = Math.min(
        parseInt(storedEnergy, 10) +
          Math.floor(timePassed * storedRefillRateNum),
        parseInt(storedMaxEnergy, 10)
      );

      console.log("calculatedEnergy:", calculatedEnergy);

      setEnergy(calculatedEnergy);
      setMaxEnergy(parseInt(storedMaxEnergy, 10));
      setRefillRate(storedRefillRateNum);
      setLastUpdated(Date.now());

      //dowm is for autoincrement time on offline
      const storedAutoIncrementNum = parseFloat(storedAutoIncrement);
      const calculatedBalance =
        parseFloat(storedBalance) +
        Math.min(
          storedAutoIncrementNum * timePassed,
          storedAutoIncrementNum * 7200
        );
      balanceRef.current.value = Math.round(calculatedBalance * 100) / 100;
      //D4
      if (storedLocalTotalExchange) {
        setLocalTotalExchange(parseFloat(storedLocalTotalExchange));
      }
    }
    setIsInitialLoad(false); // Set initial load flag to false after loading from localStorage
  }, []);

  // Save state to localStorage only after the initial load is complete
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("energy", energy.toString());
      localStorage.setItem("maxEnergy", maxEnergy.toString());
      localStorage.setItem("refillRate", refillRate.toString());
      localStorage.setItem("lastUpdated", lastUpdated.toString());
      //down is auto increment
      localStorage.setItem("balance", balanceRef.current.value.toString());
      localStorage.setItem("autoIncrement", autoIncrement.toString());
      //D4
      localStorage.setItem("localTotalExchange", localTotalExchange.toString());
    }
  }, [
    energy,
    maxEnergy,
    refillRate,
    lastUpdated,
    isInitialLoad,
    localTotalExchange,
  ]);
  useEffect(() => {
    // Initialize the Telegram Web App SDK
    const initTelegram = () => {
      const tg = window.Telegram.WebApp;
      tg.ready();
      // Debug logging
      console.log("Telegram Web App SDK initialized");
      console.log("tg.initDataUnsafe:", tg.initDataUnsafe);

      const user = tg.initDataUnsafe?.user;

      if (user) {
        const id = user.id.toString();
        setUserId(user.id.toString());
        sendUserDataToFirebase(id, autoIncrement);
      }
    };

    if (window.Telegram) {
      console.log("Telegram SDK is already loaded");
      initTelegram();
    } else {
      console.log("Waiting for Telegram SDK to be ready");
      window.addEventListener("TelegramWebAppReady", initTelegram);
    }

    return () => {
      window.removeEventListener("TelegramWebAppReady", initTelegram);
    };
  }, []);

  //up is user
  //D4
  useEffect(() => {
    if (userId) {
      const exchangeRef = ref(db, `users/${userId}/exchanges/amount`);

      const unsubscribe = onValue(exchangeRef, (snapshot) => {
        const amount = snapshot.val();
        setLocalTotalExchange((amount || 0) / 3600);
        //alert(`Exchange amount updated: ${amount}`);
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [userId]);

  //routuerchange1
  const upgradeMap = useRef(
    new Map<string, UpgradeState>([
      ["clickUpgrade", new UpgradeState(15, 2, 1, 2)],
      ["autoClicker01", new UpgradeState(80, 2, 0, 0.1)],
      ["autoClicker02", new UpgradeState(200, 2, 0, 0.5)],
      ["autoClicker03", new UpgradeState(1000, 2, 0, 0.8)],
      ["autoClicker04", new UpgradeState(5000, 2, 0, 1)],
      ["autoClicker05", new UpgradeState(5000, 2, 0, 1)],
      ["autoClicker06", new UpgradeState(5000, 2, 0, 1)],
      ["autoClicker07", new UpgradeState(10000, 2, 0, 1.5)],
      ["autoClicker08", new UpgradeState(10000, 2, 0, 1.5)],
      ["autoClicker09", new UpgradeState(20000, 2, 0, 2)],
      ["autoClicker10", new UpgradeState(20000, 2, 0, 2)],
      //ref card
      ["refClicker01", new UpgradeState(500, 2, 0, 1)],
      ["refClicker02", new UpgradeState(1500, 2, 0, 1.5)],
      ["refClicker03", new UpgradeState(1500, 2, 0, 1.5)],
      ["refClicker04", new UpgradeState(4000, 2, 0, 2)],
      ["refClicker05", new UpgradeState(4000, 2, 0, 2)],
      ["refClicker06", new UpgradeState(1500, 2, 0, 1.5)],
      ["refClicker07", new UpgradeState(4000, 2, 0, 2)],
      ["refClicker08", new UpgradeState(8000, 2, 0, 2.5)],
      ["refClicker09", new UpgradeState(18000, 2, 0, 3)],
      ["refClicker10", new UpgradeState(3000, 2, 0, 1.5)],
      ["refClicker11", new UpgradeState(3000, 2, 0, 1.5)],
      ["refClicker12", new UpgradeState(18000, 2, 0, 3)],
      ["refClicker13", new UpgradeState(8000, 2, 0, 2.5)],
      ["refClicker14", new UpgradeState(30000, 2, 0, 3.5)],
      //ref card
      ["adsClicker01", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker02", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker03", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker04", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker05", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker06", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker07", new UpgradeState(5000, 2, 0, 2)],
      ["adsClicker08", new UpgradeState(5000, 2, 0, 2)],
    ])
  );

  const upgradeEnergyMap = useRef(
    new Map<string, UpgradeEnergy>([
      ["energyPool", new UpgradeEnergy(40, 1.4, 50, 0)],
      ["energyfill", new UpgradeEnergy(70, 2, 0, 1)],
      // Add other entries as needed
    ])
  );

  let autoIncrement: number =
    Math.round(
      (upgradeMap.current.get("autoClicker01")!.increment +
        upgradeMap.current.get("autoClicker02")!.increment +
        upgradeMap.current.get("autoClicker03")!.increment +
        upgradeMap.current.get("autoClicker04")!.increment +
        upgradeMap.current.get("autoClicker05")!.increment +
        upgradeMap.current.get("autoClicker06")!.increment +
        upgradeMap.current.get("autoClicker07")!.increment +
        upgradeMap.current.get("autoClicker08")!.increment +
        upgradeMap.current.get("autoClicker09")!.increment +
        upgradeMap.current.get("autoClicker10")!.increment +
        //ref card
        upgradeMap.current.get("refClicker01")!.increment +
        upgradeMap.current.get("refClicker02")!.increment +
        upgradeMap.current.get("refClicker03")!.increment +
        upgradeMap.current.get("refClicker04")!.increment +
        upgradeMap.current.get("refClicker05")!.increment +
        upgradeMap.current.get("refClicker06")!.increment +
        upgradeMap.current.get("refClicker07")!.increment +
        upgradeMap.current.get("refClicker08")!.increment +
        upgradeMap.current.get("refClicker09")!.increment +
        upgradeMap.current.get("refClicker10")!.increment +
        upgradeMap.current.get("refClicker11")!.increment +
        upgradeMap.current.get("refClicker12")!.increment +
        upgradeMap.current.get("refClicker13")!.increment +
        upgradeMap.current.get("refClicker14")!.increment +
        //ads
        upgradeMap.current.get("adsClicker01")!.increment +
        upgradeMap.current.get("adsClicker02")!.increment +
        upgradeMap.current.get("adsClicker03")!.increment +
        upgradeMap.current.get("adsClicker04")!.increment +
        upgradeMap.current.get("adsClicker05")!.increment +
        upgradeMap.current.get("adsClicker06")!.increment +
        upgradeMap.current.get("adsClicker07")!.increment +
        upgradeMap.current.get("adsClicker08")!.increment) *
        100
    ) /
      100 -
    localTotalExchange;

  //downdatabase
  useEffect(() => {
    if (userId !== null) {
      updateUserAutoIncrementInFirebase(userId, autoIncrement);
    }
  }, [autoIncrement]);
  //updatabse

  useEffect(() => {
    const interval = setInterval(() => {
      balanceRef.current.value =
        Math.round((balanceRef.current.value + autoIncrement / 10) * 100) / 100;
      forceUpdate();
    }, 100);

    return () => clearInterval(interval);
  });

  useEffect(() => {
    const refillInterval = setInterval(() => {
      setEnergy((prevEnergy) => {
        const newEnergy = Math.min(prevEnergy + refillRate, maxEnergy);
        setLastUpdated(Date.now());
        return newEnergy;
      });
    }, 1000);

    return () => clearInterval(refillInterval);
  }, [refillRate, maxEnergy]);

  const upgradeInvocationHandler = (
    id: string,
    upgradeMap: React.MutableRefObject<Map<string, UpgradeState>>,
    upgradeEnergyMap: React.MutableRefObject<Map<string, UpgradeEnergy>>,
    balanceRef: React.MutableRefObject<{ value: number }>,
    setMaxEnergy: React.Dispatch<React.SetStateAction<number>>,
    setRefillRate: React.Dispatch<React.SetStateAction<number>>
  ): void => {
    if (upgradeMap.current.has(id)) {
      const cost = upgradeMap.current.get(id)!.currentCost;
      if (upgradeMap.current.get(id)!.upgrade(balanceRef.current.value)) {
        console.log(`Upgraded ${id} component.`);
        balanceRef.current.value =
          Math.round((balanceRef.current.value - cost) * 100) / 100;
      } else {
        console.log(`Balance is too low to upgrade ${id} component.`);
      }
    }
  };

  const handleRewardClaimed = () => {
    forceUpdate(); // Force an update to reflect the new balance
  };
  return (
    <>
      <SaveGame
        balanceRef={balanceRef}
        upgradeMap={upgradeMap}
        upgradeEnergyMap={upgradeEnergyMap}
        userId={userId}
      />
      <ShareBal
        balanceRef={balanceRef}
        clickIncrement={upgradeMap.current.get("clickUpgrade")!.increment}
        autoIncrement={autoIncrement}
        refillRate={refillRate}
      />

      <div className="row center">
        <div className="col-6">
          <AdsCard
            id="adsClicker01"
            ads="http://easy4skip.com/lF1akz7"
            password={[
              "G7hK8L",
              "P2nX5Z", // Sunday
              "V4rM9Q",
              "J6yT3B", // Monday
              "L8vW7N",
              "C1mK4R", // Tuesday
              "Q3zY2F",
              "D5pL6S", // Wednesday
              "E9wV1X",
              "H2bT7M", // Thursday
              "R4jP8G",
              "K6nW3C", // Friday
              "M1xQ9F",
              "Z7tL5J", // Saturday
            ]}
            name="Yeti"
            level={upgradeMap.current.get("adsClicker01")!.level}
            cost={upgradeMap.current.get("adsClicker01")!.currentCost}
            increment={upgradeMap.current.get("adsClicker01")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker03"
            ads="http://easy4skip.com/m6hPAREZ"
            password={[
              "N6yQ7M",
              "W2rK3J", // Sunday
              "B5jL9X",
              "H4gP8R", // Monday
              "T1vN2Z",
              "Q8mW6C", // Tuesday
              "D3kO5F",
              "X7bV4J", // Wednesday
              "P9tM1L",
              "G6yR8N", // Thursday
              "F2qK7Z",
              "M4wJ5C", // Friday
              "L8pN3X",
              "S1gT9V", // Saturday
            ]}
            name="Valkyrie"
            level={upgradeMap.current.get("adsClicker03")!.level}
            cost={upgradeMap.current.get("adsClicker03")!.currentCost}
            increment={upgradeMap.current.get("adsClicker03")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker05"
            ads="http://easy4skip.com/7qOXa"
            password={[
              "Z8tM9L",
              "Y3rK2V", // Sunday
              "X1pW4Q",
              "N6yX5C", // Monday
              "J9mL8N",
              "Q2rO3J", // Tuesday
              "B5vF7M",
              "R7qK1G", // Wednesday
              "C6wN4R",
              "D9jT8Y", // Thursday
              "A4bX2Z",
              "S1pV7Q", // Friday
              "L3nJ5C",
              "M6kL9M", // Saturday
            ]}
            name="Kraken"
            level={upgradeMap.current.get("adsClicker05")!.level}
            cost={upgradeMap.current.get("adsClicker05")!.currentCost}
            increment={upgradeMap.current.get("adsClicker05")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker07"
            ads="http://easy4skip.com/XKbWbL40"
            password={[
              "M9tL7R",
              "N2rK8V", // Sunday
              "J1pW4Q",
              "F5yX9C", // Monday
              "K3mL6N",
              "P8rO1J", // Tuesday
              "T4vF9M",
              "H7qK2G", // Wednesday
              "L6wN5R",
              "C9jT3Y", // Thursday
              "Z4bX1F",
              "S8pV7Q", // Friday
              "D3nJ9C",
              "B6kL4M", // Saturday
            ]}
            name="Orge"
            level={upgradeMap.current.get("adsClicker07")!.level}
            cost={upgradeMap.current.get("adsClicker07")!.currentCost}
            increment={upgradeMap.current.get("adsClicker07")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
        </div>
        <div className=" col-6">
          <AdsCard
            id="adsClicker02"
            ads="http://easy4skip.com/uvYYkTuU"
            password={[
              "B7xP8H",
              "T5qN3Y", // Sunday
              "F4rL6M",
              "Q1vK9Z", // Monday
              "U3wJ2X",
              "G6tO7C", // Tuesday
              "H2nP4V",
              "A9yR5F", // Wednesday
              "E8bW1L",
              "D7sM3Q", // Thursday
              "C5kT9J",
              "P4gN2Y", // Friday
              "V1mL6R",
              "Z8jQ5X", // Saturday
            ]}
            name="Cyclops"
            level={upgradeMap.current.get("adsClicker02")!.level}
            cost={upgradeMap.current.get("adsClicker02")!.currentCost}
            increment={upgradeMap.current.get("adsClicker02")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker04"
            ads="http://easy4skip.com/Bugz"
            password={[
              "J9nM8L",
              "S4kV2Z", // Sunday
              "R1pW3Q",
              "E7yX5C", // Monday
              "K6mL9N",
              "P8rO4J", // Tuesday
              "T3vF7M",
              "C2qK1G", // Wednesday
              "L5wN6R",
              "M9jT8Y", // Thursday
              "H4bX2Z",
              "G1pV7Q", // Friday
              "W3nJ5C",
              "F6kL9M", // Saturday
            ]}
            name=" Chimera"
            level={upgradeMap.current.get("adsClicker04")!.level}
            cost={upgradeMap.current.get("adsClicker04")!.currentCost}
            increment={upgradeMap.current.get("adsClicker04")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker06"
            ads="http://easy4skip.com/WFVq"
            password={[
              "Q7hL6M",
              "N4rK5V", // Sunday
              "P1pW8J",
              "R9yX2C", // Monday
              "T3mL7N",
              "V6rO4J", // Tuesday
              "W5vF9M",
              "Y2qK1G", // Wednesday
              "Z6wN4R",
              "X9jT3Y", // Thursday
              "B4bX1Z",
              "C8pV7Q", // Friday
              "D3nJ5C",
              "E6kL9M", // Saturday
            ]}
            name=" Griffin"
            level={upgradeMap.current.get("adsClicker06")!.level}
            cost={upgradeMap.current.get("adsClicker06")!.currentCost}
            increment={upgradeMap.current.get("adsClicker06")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
          <AdsCard
            id="adsClicker08"
            ads="http://easy4skip.com/Jo4YE1Tp"
            password={[
              "L4tM2F",
              "K7rK9V", // Sunday
              "H1pW8C",
              "N2yX5Q", // Monday
              "M6mL7J",
              "F9rO3N", // Tuesday
              "J5vF1R",
              "C8qK4G", // Wednesday
              "T9wN6M",
              "D2jT3Y", // Thursday
              "X3bX5F",
              "Z7pV1R", // Friday
              "P2nJ4C",
              "B9kL8M", // Saturday
            ]}
            name=" Fenrir"
            level={upgradeMap.current.get("adsClicker08")!.level}
            cost={upgradeMap.current.get("adsClicker08")!.currentCost}
            increment={upgradeMap.current.get("adsClicker08")!.incrementAdd}
            balance={balanceRef.current.value}
            autoIncrementTotal={autoIncrement}
            clickHandler={(id) => {
              upgradeInvocationHandler(
                id,
                upgradeMap,
                upgradeEnergyMap,
                balanceRef,
                setMaxEnergy,
                setRefillRate
              );
            }}
          />
        </div>
      </div>

      {/*down are overlay and container  */}
    </>
  );
}
