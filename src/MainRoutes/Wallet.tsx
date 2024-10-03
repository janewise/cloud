
import React from "react";
import { Route, Routes, NavLink, Navigate } from "react-router-dom";
import "./SecNavcss/walletnav.css";
import { SwapMain } from "../SecRoutes/SwapTk/swapmain";
import { TransferMain } from "../SecRoutes/TransferTk/transfermain";

export function Wallet() {
  return (
    <>
      <div className="overlay">
        <div className="container-fluid">
          <nav className="wallet_nav">
            <ul>
              <li>
                <NavLink 
                  to="/wallet/swapmain" 
                  className={({ isActive }) => isActive ? "minelink active" : "minelink"}
                >
                  Swap
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/wallet/transfermain" 
                  className={({ isActive }) => isActive ? "minelink active" : "minelink"}
                >
                 Transfer
                </NavLink>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Navigate to="swapmain" />} />
            <Route path="swapmain" element={<SwapMain />} />
            <Route path="transfermain" element={<TransferMain />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
