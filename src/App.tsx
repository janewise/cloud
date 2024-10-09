import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import { Mine } from "./MainRoutes/Mine";
import { Coin } from "./MainRoutes/Coin";
import { Nav } from "./MainRoutes/Nav";
import { Friend } from "./MainRoutes/Friend";
import { Tasksec } from "./MainRoutes/Tasksec";
import { Wallet } from "./MainRoutes/Wallet";
import { Connect } from "./SecRoutes/Connect/connect";

export function App() {
  return (
    <>
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<Coin />} />
          <Route path="/mine/*" element={<Mine />} />
          <Route path="/friend" element={<Friend />} />
          <Route path="/tasksec/*" element={<Tasksec />} />
          <Route path="/wallet/*" element={<Wallet />} />
          <Route path="/connect" element={<Connect />} />
        </Routes>
      </Router>
    </>
  );
}

//npm install react-router-dom @types/react-router-dom
