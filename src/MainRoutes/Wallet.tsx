import React, { useState, useEffect } from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import { SwapMain } from "../SecRoutes/SwapTk/swapmain";
import { TransferMain } from "../SecRoutes/TransferTk/transfermain";
import { Claimtk } from "../SecRoutes/Claimtk/claim";
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import "./SecNavcss/walletnav.css";

export function Wallet() {

  const [userId, setUserId] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the Telegram Web App SDK
    const initTelegram = () => {
      const tg = window.Telegram.WebApp;
      tg.ready();
      console.log("Telegram Web App SDK initialized");
      console.log("tg.initDataUnsafe:", tg.initDataUnsafe);

      const user = tg.initDataUnsafe?.user;

      if (user) {
        setUserId(user.id.toString());
        fetchUserWallet(user.id.toString());
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


  // Function to fetch and set the connected wallet from Firebase
  const fetchUserWallet = async (userId: string) => {
    const userRef = ref(db, "users/" + userId);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const wallet = userData?.addresswallet?.polygonwallet || null;
        setConnectedWallet(wallet);
      } else {
        setConnectedWallet(null);
      }
    } catch (error) {
      console.error("Error fetching wallet address:", error);
      setConnectedWallet(null);
    }
  };

  // Function to shorten the wallet address (e.g., 0x0C68b...45B3E)
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="overlay">
        <div className="container-fluid">
        <div className="connectwalletnav">
            {/* If no wallet is connected, show the "Connect" link */}
            {!connectedWallet ? (
              <NavLink to="/connect" className="minelink walletconnect">Connect</NavLink>
            ) : (
              // If wallet is connected, display the shortened address
              <NavLink to="/connect" className="minelink walletaddress">
                {shortenAddress(connectedWallet)}
              </NavLink>
            )}
          </div>

          <nav className="wallet_nav">
            <ul>
              <li>
                <NavLink 
                  to="/swapmain" 
                  className={({ isActive }) => isActive ? "minelink active" : "minelink"}
                >
                  Swap
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/transfermain" 
                  className={({ isActive }) => isActive ? "minelink active" : "minelink"}
                >
                 Transfer
                </NavLink>
              </li>
               <li>
                <NavLink 
                  to="/claim" 
                  className={({ isActive }) => isActive ? "minelink active" : "minelink"}
                >
                 Claim
                </NavLink>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Navigate to="swapmain" />} />
            <Route path="swapmain" element={<SwapMain />} />
            <Route path="transfermain" element={<TransferMain />} />
              <Route path="claim" element={<Claimtk />} />

          </Routes>
        </div>
      </div>
    </>
  );
}
