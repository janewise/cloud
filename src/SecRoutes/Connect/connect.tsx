
import React, { useRef, useEffect, useState } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../../firebase";
import polygonlogo from "./polygonMatic.png";
import { Snackbar } from "@mui/material";
import {ImageUpload} from "./upload"
import "./connect.css";

export function Connect() {
  const [userId, setUserId] = useState<string | null>(null);
  const [imageVerified, setImageVerified] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState(""); // State to store the wallet address
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // State to store the connected wallet
  const [successMessage, setSuccessMessage] = useState<boolean>(false); // State to store the success message
  const [SuccessDisconnect, setSuccessDisconnect] = useState<boolean>(false);
  const [Successcopy, setSuccesscopy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState(""); // State to store any error message

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

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form from reloading the page
    if (!walletAddress || !userId) {
      setErrorMessage("Please enter a valid wallet address and user ID.");
      return;
    }

    const userRef = ref(db, "users/" + userId);

    const structuredData = {
      addresswallet: {
        polygonwallet: walletAddress,
      },
    };

    try {
      // Update Firebase with the new wallet address
      await update(userRef, structuredData);
      setSuccessMessage(true);
      setConnectedWallet(walletAddress); // Set connected wallet after success
      setWalletAddress(""); // Clear the input field after successful update
      setErrorMessage(""); // Clear any error messages
    } catch (error) {
      console.error("Error updating wallet address:", error);
      setErrorMessage("Failed to update wallet address. Please try again.");
    }
  };

  //shorten walletadress
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 7)}...${address.slice(-5)}`;
  };
  //copy walletadress
  const handleCopy = () => {
    if (connectedWallet) {
      navigator.clipboard
        .writeText(connectedWallet)
        .then(() => {
          setSuccesscopy(true);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      console.error("No wallet address to copy.");
    }
  };

  // Function to handle disconnect
  const handleDisconnect = async () => {
    if (!userId) return;
    const userRef = ref(db, "users/" + userId);

    const structuredData = {
      addresswallet: {
        polygonwallet: "",
      },
    };

    try {
      // Update Firebase to reset the wallet address
      await update(userRef, structuredData);
      setSuccessDisconnect(true);
      setConnectedWallet(null); // Reset the connected wallet
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setErrorMessage("Failed to disconnect wallet. Please try again.");
    }
  };


//for imageverified
useEffect(() => {
  // Fetch the imageverified value from Firebase
  const fetchImageVerifiedStatus = async () => {
    try {
      const userImagesRef = ref(db, `users/${userId}/images/imageverified`);
      const snapshot = await get(userImagesRef);
      if (snapshot.exists()) {
        setImageVerified(snapshot.val());
      } else {
        setImageVerified(false); // Default to false if no value exists
      }
    } catch (error) {
      console.error("Error fetching imageverified status:", error);
      setErrorMessage("Failed to fetch image verification status.");
    }
  };

  if (userId) {
    fetchImageVerifiedStatus();
  }
}, [userId]);

  return (
    <>
      <div className="overlay">
        <div className="container-fluid connectform">

        {userId && !imageVerified && <ImageUpload telegramUserId={userId} />}
        {/* <ImageUpload telegramUserId={userId}/>  */}
        {imageVerified && (
          <div className="canconnectwallet">
          <img src={polygonlogo} alt="polygon logo" className="polygonlogo" />
          {/* Conditionally show form if no wallet is connected */}
          {!connectedWallet ? (
            <form onSubmit={handleSubmit} className="adressform">
              <h5>Enter your Polygon WalletAddress</h5>
              <br />
              <div>
                <input
                  className="userwalletinputfield"
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  minLength={15}
                  required
                />
              </div>
              <button type="submit" className="connectbutton">
                Connect
              </button>
            </form>
          ) : (
            <div className="wallet-connected">
              <h5>
                {" "}
                {shortenAddress(connectedWallet)}
                <span onClick={handleCopy} className="providewalleticon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="15"
                    fill="#8247e5"
                    className="bi bi-copy"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                    />
                  </svg>
                </span>
              </h5>
              <button className="disconnectbutton" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          )}
          </div>
           )}
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
   
      {/* for success connect */}
      {Successcopy && (
        <Snackbar
          open={Successcopy}
          autoHideDuration={700}
          message="Copied Successful!"
          onClose={() => setSuccesscopy(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          ContentProps={{
            sx: { backgroundColor: "lightgreen", color: "white" },
          }}
        />
      )}
      {/* for success connect */}
      {successMessage && (
        <Snackbar
          open={successMessage}
          autoHideDuration={1500}
          message="Connect Successful!"
          onClose={() => setSuccessMessage(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          ContentProps={{
            sx: { backgroundColor: "green", color: "white" },
          }}
        />
      )}
      {/* for success disconnect */}
      {SuccessDisconnect && (
        <Snackbar
          open={SuccessDisconnect}
          autoHideDuration={1500}
          message="Wallet Disconnect!"
          onClose={() => setSuccessDisconnect(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          ContentProps={{
            sx: { backgroundColor: "red", color: "white" },
          }}
        />
      )}
    </>
  );
}
