import React, { useRef, useEffect, useReducer, useState } from "react";
//for ts
import UpgradeState from "../../classes/upgradeState";
import UpgradeEnergy from "../../classes/upgradeEnergy";
//for Task
import RefTaskCard from "../../components/TaskCard/reftaskcard";
//fire base
//import { sendUserDataToFirebase,updateUserAutoIncrementInFirebase} from '../firebaseFunctions';

export function Reftask() {
  const balanceRef = useRef({ value: 0 });
  const forceUpdate = useReducer((x) => x + 1, 0)[1];

  const [energy, setEnergy] = useState(10000);
  const [maxEnergy, setMaxEnergy] = useState(10000);
  const [refillRate, setRefillRate] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  //user
  const [userId, setUserId] = useState<string | null>(null);

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
    }
  }, [energy, maxEnergy, refillRate, lastUpdated, isInitialLoad]);
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
        //sendUserDataToFirebase(id, autoIncrement);
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
        upgradeMap.current.get("refClicker14")!.increment ) *
        100
    ) / 100;

  //database
  // useEffect(() => {
  //   if (userId !== null) {
  //     updateUserAutoIncrementInFirebase(userId, autoIncrement);
  //   }
  // }, [autoIncrement]);
  //databse

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
    } else if (upgradeEnergyMap.current.has(id)) {
      const cost = upgradeEnergyMap.current.get(id)!.currentCost;
      if (upgradeEnergyMap.current.get(id)!.upgrade(balanceRef.current.value)) {
        console.log(`Upgraded ${id} energy component.`);
        balanceRef.current.value =
          Math.round((balanceRef.current.value - cost) * 100) / 100;
        // Handle changes to energy attributes
        if (id === "energyPool") {
          const newMaxEnergy =
            upgradeEnergyMap.current.get(id)!.maxEnergyIncrement;
          setMaxEnergy((prevMaxEnergy) => prevMaxEnergy + newMaxEnergy);
          console.log("energy pool+");
        } else if (id === "energyfill") {
          const newRefillRate =
            upgradeEnergyMap.current.get(id)!.energyRefillIncrement;
          setRefillRate((prevRefillRate) => prevRefillRate + newRefillRate);
          console.log("energy +");
        }
      } else {
        console.log(`Balance is too low to upgrade ${id} energy component.`);
      }
    }
  };

  const handleRewardClaimed = () => {
    forceUpdate(); // Force an update to reflect the new balance
  };

  return (
    <>
      <div className=" Task row">
        <h2>Invite Friends and earn Rewards</h2>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 1 friend"
            reward={10000}
            show="10k"
            refercount={1}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 2 friends"
            reward={30000}
            show="30k"
            refercount={2}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 3 friends"
            reward={50000}
            show="50k"
            refercount={3}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 5 friends"
            reward={100000}
            show="100k"
            refercount={5}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 8 friends"
            reward={300000}
            show="300k"
            refercount={8}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 10 friends"
            reward={800000}
            show="800k"
            refercount={10}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 15 friends"
            reward={1500000}
            show="1.5M"
            refercount={15}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 25 friends"
            reward={3000000}
            show="3M"
            refercount={25}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
          <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 50 friends"
            reward={10000000}
            show="10M"
            refercount={50}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        <div className="col-sm col-md-6 col-lg-4">
          <RefTaskCard
            name="invite 100 friends"
            reward={100000000}
            show="100M"
            refercount={100}
            userId={userId}
            balanceRef={balanceRef}
            onRewardClaimed={handleRewardClaimed}
          />
        </div>
        </div>
        {/* // */}
      </div>
    </>
  );
}
