// import React, { useRef, useEffect, useState } from "react";
// import { db } from "../../firebase";
// import { ref, onValue, get, runTransaction } from "firebase/database";
// import "./claim.css"

// export function Claimtk(){

//     const [totalTokens, setTotalTokens] = useState<number>(0);
//     const [userId, setUserId] = useState<string | null>(null);
//     const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // State to store the connected wallet

//     useEffect(() => {
//         // Initialize the Telegram Web App SDK
//         const initTelegram = () => {
//           const tg = window.Telegram.WebApp;
//           tg.ready();
//           console.log("Telegram Web App SDK initialized");
//           console.log("tg.initDataUnsafe:", tg.initDataUnsafe);
    
//           const user = tg.initDataUnsafe?.user;
    
//           if (user) {
//             setUserId(user.id.toString());
//             fetchUserWallet(user.id.toString());
//           }
//         };
    
//         if (window.Telegram) {
//           console.log("Telegram SDK is already loaded");
//           initTelegram();
//         } else {
//           console.log("Waiting for Telegram SDK to be ready");
//           window.addEventListener("TelegramWebAppReady", initTelegram);
//         }
    
//         return () => {
//           window.removeEventListener("TelegramWebAppReady", initTelegram);
//         };
//       }, []);
    
// //02
//   // Function to fetch and set the connected wallet from Firebase
//   const fetchUserWallet = async (userId: string) => {
//     const userRef = ref(db, "users/" + userId);
//     try {
//       const snapshot = await get(userRef);
//       if (snapshot.exists()) {
//         const userData = snapshot.val();
//         const wallet = userData?.addresswallet?.polygonwallet || null;
//         setConnectedWallet(wallet);
//       } else {
//         setConnectedWallet(null);
//       }
//     } catch (error) {
//       console.error("Error fetching wallet address:", error);
//       setConnectedWallet(null);
//     }
//   };
// //03
// useEffect(() => {
//     if (userId) {
//       const exchangeRef = ref(db, `users/${userId}/exchanges/tokens`);

//       const unsubscribe = onValue(exchangeRef, (snapshot) => {
//         const tokens = snapshot.val();
//         setTotalTokens(tokens || 0);
//       });

//       return () => unsubscribe();
//     }
//   }, [userId]);


//     return(
//         <div className="Claim">
//             <div className="claimtoken">
//                 <div className="claimnote">
//                     <p>Total Token - {totalTokens}</p>
//                     <p>Transition fee  - 20%</p>
//                     <hr />
//                     <p>Claimable Token  - 33333</p>
//                 </div>
//             </div>

//             <button className="claimbutton">
//           Claim
//         </button>
//         </div>
//     );

//  };

// import React, { useEffect, useState } from "react";
// import { db } from "../../firebase";
// import { ref, onValue, get, runTransaction } from "firebase/database";
// import "./claim.css";

// export function Claimtk() {
//   const [totalTokens, setTotalTokens] = useState<number>(0);
//   const [walletAddress, setWalletAddress] = useState(""); // State to store the wallet address
//   const [userId, setUserId] = useState<string | null>(null);
//   const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // State to store the connected wallet
//   const [claimableTokens, setClaimableTokens] = useState<number>(0); // State to store claimable tokens
//   const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to store error message

//   useEffect(() => {
//     // Initialize the Telegram Web App SDK
//     const initTelegram = () => {
//       const tg = window.Telegram.WebApp;
//       tg.ready();
//       console.log("Telegram Web App SDK initialized");
//       console.log("tg.initDataUnsafe:", tg.initDataUnsafe);

//       const user = tg.initDataUnsafe?.user;

//       if (user) {
//         setUserId(user.id.toString());
//         fetchUserWallet(user.id.toString());
//       }
//     };

//     if (window.Telegram) {
//       console.log("Telegram SDK is already loaded");
//       initTelegram();
//     } else {
//       console.log("Waiting for Telegram SDK to be ready");
//       window.addEventListener("TelegramWebAppReady", initTelegram);
//     }

//     return () => {
//       window.removeEventListener("TelegramWebAppReady", initTelegram);
//     };
//   }, []);

//   // Function to fetch and set the connected wallet from Firebase
//   const fetchUserWallet = async (userId: string) => {
//     const userRef = ref(db, "users/" + userId);
//     try {
//       const snapshot = await get(userRef);
//       if (snapshot.exists()) {
//         const userData = snapshot.val();
//         const wallet = userData?.addresswallet?.polygonwallet || null;
//         setConnectedWallet(wallet);
//       } else {
//         setConnectedWallet(null);
//       }
//     } catch (error) {
//       console.error("Error fetching wallet address:", error);
//       setConnectedWallet(null);
//     }
//   };

//   useEffect(() => {
//     if (userId) {
//       const exchangeRef = ref(db, `users/${userId}/exchanges/tokens`);

//       const unsubscribe = onValue(exchangeRef, (snapshot) => {
//         const tokens = snapshot.val();
//         setTotalTokens(tokens || 0);

//         // Calculate the claimable tokens after reducing 20%
//         const claimable = tokens ? tokens * 0.8 : 0;
//         setClaimableTokens(claimable);
//       });

//       return () => unsubscribe();
//     }
//   }, [userId]);

//   // Function to handle the claim button click
//   const handleClaim = async () => {
//     setErrorMessage(null); // Reset error message before validating

//     // Check for errors
//     if (!connectedWallet) {
//       setErrorMessage("Wallet address is required.");
//       return;
//     }
//     if (totalTokens <= 0) {
//       setErrorMessage("Insufficient tokens to claim.");
//       return;
//     }

//     const userRef = ref(db, "users/" + userId);
//     try {
//       await runTransaction(userRef, (userData) => {
//         if (userData) {
//           // Update the user's wallet address and set pending/claim states
//           userData.addresswallet = {
//             polygonwallet: walletAddress,
//           };
//           userData.pendingstate = true;
//           userData.claimstate = false; // Initially set claim state to false
//           return userData;
//         }
//       });

//       console.log("Claim process started, pending state set.");
//     } catch (error) {
//       console.error("Error claiming tokens:", error);
//       setErrorMessage("Error during the claim process.");
//     }
//   };

//   return (
//     <div className="Claim">
//       <div className="claimtoken">
//         <div className="claimnote">
//           <p>Total Token - {totalTokens}</p>
//           <p>Transition fee - 20%</p>
//           <hr />
//           <p>Claimable Token - {claimableTokens}</p>
//         </div>
//       </div>

//       <button className="claimbutton" onClick={handleClaim}>
//         Claim
//       </button>

//       {errorMessage && <p className="error">{errorMessage}</p>}
//     </div>
//   );
// }

// 
import React from "react";
import "./claim.css";

export function Claimtk(){
  return(
    <div className="Claim">
        <div className="claimtoken"> <h2>
        Blah Blah
      </h2></div>
     
    </div>
  )
}


//

// import React, { useEffect, useState } from "react";
// import { db } from "../../firebase";
// import { ref, onValue, get, update } from "firebase/database";
// import "./claim.css";

// export function Claimtk() {
//   const [totalTokens, setTotalTokens] = useState<number>(0);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [claimableTokens, setClaimableTokens] = useState<number>(0);
//   const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
//   const [pendingState, setPendingState] = useState<boolean | null>(null); // Track the pending state
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const initTelegram = () => {
//       const tg = window.Telegram.WebApp;
//       tg.ready();
//       console.log("Telegram Web App SDK initialized");

//       const user = tg.initDataUnsafe?.user;

//       if (user) {
//         setUserId(user.id.toString());
//         fetchUserWallet(user.id.toString());
//         fetchPendingState(user.id.toString());
//       }
//     };

//     if (window.Telegram) {
//       initTelegram();
//     } else {
//       window.addEventListener("TelegramWebAppReady", initTelegram);
//     }

//     return () => {
//       window.removeEventListener("TelegramWebAppReady", initTelegram);
//     };
//   }, []);

//   const fetchUserWallet = async (userId: string) => {
//     const userRef = ref(db, "users/" + userId);
//     try {
//       const snapshot = await get(userRef);
//       if (snapshot.exists()) {
//         const userData = snapshot.val();
//         const wallet = userData?.addresswallet?.polygonwallet || null;
//         setConnectedWallet(wallet);
//       } else {
//         setConnectedWallet(null);
//       }
//     } catch (error) {
//       console.error("Error fetching wallet address:", error);
//       setConnectedWallet(null);
//     }
//   };

//   // Fetch pending state from Firebase
//   const fetchPendingState = async (userId: string) => {
//     const userRef = ref(db, `users/${userId}/addresswallet`);
//     try {
//       const snapshot = await get(userRef);
//       if (snapshot.exists()) {
//         const userData = snapshot.val();
//         setPendingState(userData?.pendingstate || false);
//       } else {
//         setPendingState(false); // If no pending state exists, assume it's not pending
//       }
//     } catch (error) {
//       console.error("Error fetching pending state:", error);
//     }
//   };

//   useEffect(() => {
//     if (userId) {
//       const exchangeRef = ref(db, `users/${userId}/exchanges/tokens`);
//       const unsubscribe = onValue(exchangeRef, (snapshot) => {
//         const tokens = snapshot.val();
//         setTotalTokens(tokens || 0);

//         const claimable = tokens ? tokens * 0.8 : 0;
//         setClaimableTokens(claimable);
//       });

//       return () => unsubscribe();
//     }
//   }, [userId]);

//   const handleClaimSubmit = async () => {
//     if (!connectedWallet || totalTokens <= 0) {
//       setErrorMessage(
//         connectedWallet
//           ? "You don't have enough tokens to claim."
//           : "Please connect your wallet before claiming."
//       );
//       return;
//     }

//     if (!userId) return;

//     const userRef = ref(db, `users/${userId}/addresswallet`);

//     try {
//       await update(userRef, {
//         pendingstate: true, // Set the claim as pending
//         claimstate: false
//       });
//       console.log("Claim submitted successfully");
//       setPendingState(true); // Set pending state to true after submission
//       setErrorMessage(null);
//     } catch (error) {
//       console.error("Error updating claim state:", error);
//       setErrorMessage("Error submitting claim. Please try again.");
//     }
//   };

//   return (
//     <div className="Claim">
//       {pendingState ? (
//         <div className="pendingMessage">
//           <p>Your claim is pending. Please wait for approval.</p>
//         </div>
//       ) : (
//         <div>
//           <div className="claimtoken">
//             <div className="claimnote">
//               <p>Total Token - {totalTokens}</p>
//               <p>Transition fee - 20%</p>
//               <hr />
//               <p>Claimable Token - {claimableTokens}</p>
//             </div>
//           </div>

//           <button
//             className="claimbutton"
//             onClick={handleClaimSubmit}
//             // disabled={!connectedWallet || totalTokens <= 0}
//           >
//             Claim
//           </button>
// <br />
//           {errorMessage && <p className="error-message">{errorMessage}</p>}
//         </div>
//       )}
//     </div>
//   );
// }


