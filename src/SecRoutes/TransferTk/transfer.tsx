import { Button, Box, Typography, Modal, Snackbar } from "@mui/material";
import React, { useState, useEffect } from "react";
import { ref, onValue, get, runTransaction } from "firebase/database";
import { getDatabase } from "firebase/database";
import { db } from "../../firebase";
import "./transfer.css";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "white",
  border: "1px solid rgb(141, 130, 114)",
  boxShadow: 24,
  p: 3,
  color: "black", // Text color set to black
  borderRadius: "8px", // Border radius set to 8px
};

interface ExchangeProps {
  userId: string | null;
}

const Transfer: React.FC<ExchangeProps> = ({ userId }) => {
  const [inputValue, setInputValue] = useState<number>(0);
  //const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [congratulationOpen, setCongratulationOpen] = useState(false); // New state for congratulatory modal
  const [transferTimestamp, setTransferTimestamp] = useState<string>("");
  const [tempInputValue, setTempInputValue] = useState<number>(0);
  const [tempReceiverId, setTempReceiverId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const exchangeRef = ref(db, `users/${userId}/exchanges/tokens`);

      const unsubscribe = onValue(exchangeRef, (snapshot) => {
        const tokens = snapshot.val();
        setTotalTokens(tokens || 0);
      });

      return () => unsubscribe();
    }
  }, [userId]);

  const maxExchangeValue = Math.floor(totalTokens);
  const isClickable = inputValue > 0 && inputValue <= totalTokens;

  const handleMax = () => {
    const maxValidValue = Math.floor(totalTokens);
    setInputValue(maxValidValue);
  };

  const handleReceiverIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverId(e.target.value);
    setErrorMessage(""); // Clear the error message when the input changes
  };

  const handleOpen = () => {
    if (inputValue > totalTokens) {
      setErrorMessage("Please enter a valid token amount.");
      return;
    }

    if (!receiverId) {
      setErrorMessage("Please enter a valid receiver ID.");
      return;
    }

    // Check if the sender's ID is the same as the receiver's ID
    if (receiverId === userId) {
      setErrorMessage("You cannot transfer tokens to your own account.");
      return;
    }

    const receiverRef = ref(db, `users/${receiverId}`);
    get(receiverRef).then((snapshot) => {
      if (!snapshot.exists()) {
        setErrorMessage("Please enter a valid receiver ID.");
        return;
      } else {
        setErrorMessage("");
        setOpen(true);
      }
    });
  };

  const handleClose = () => setOpen(false);

  const handleCongratulationClose = () => setCongratulationOpen(false); // Close congratulatory modal

  const ConfirmTransfer = () => {
    if (!userId || !receiverId) return;

    const senderRef = ref(db, `users/${userId}/exchanges/tokens`);
    const receiverRef = ref(db, `users/${receiverId}/exchanges/tokens`);

    // Use runTransaction to ensure atomic updates
    runTransaction(senderRef, (currentTokens) => {
      if (currentTokens === null || currentTokens < inputValue) {
        setErrorMessage("Insufficient tokens.");
        return currentTokens;
      }

      return currentTokens - inputValue;
    })
      .then(() => {
        runTransaction(receiverRef, (currentTokens) => {
          return (currentTokens || 0) + inputValue;
        })
          .then(() => {
            // Capture the current date and time for the transfer timestamp
            const currentDate = new Date();
            const formattedDate = `${currentDate.getUTCFullYear()}/${
              currentDate.getUTCMonth() + 1
            }/${currentDate.getUTCDate()} UTC:${currentDate.getUTCHours()}:${currentDate.getUTCMinutes()}`;
            setTransferTimestamp(formattedDate);

            // Store values in temporary states before resetting
            setTempInputValue(inputValue);
            setTempReceiverId(receiverId);

            setSuccess(true);
            setOpen(false);
            setCongratulationOpen(true); // Open the congratulations modal

            // Reset input value and receiver ID
            setInputValue(0);
            setReceiverId(null);
            setErrorMessage("");
          })
          .catch((error) => {
            console.error("Error updating receiver's tokens:", error);
          });
      })
      .catch((error) => {
        console.error("Error updating sender's tokens:", error);
      });
  };

  //
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
        ];
        setUpgradeLevels(levels);
      });
    }
  }, [userId]);

  const calculateTotalValue = (levels: number[]) => {
    return levels.reduce((acc, level) => acc + (level > 4 ? 1 : 0), 0);
  };
  const totalValue = calculateTotalValue(upgradeLevels);

  return (
    <div className="transfer">
      <div className="tokenbalance">
        <h3>Token~{totalTokens}</h3>
      </div>
      {clickUpgradeLevel > 18 && totalValue > 17 && (
        <form onSubmit={(e) => e.preventDefault()} className="transferForm">
          <h5>Enter Receiver ID</h5>
          <input
            type="text"
            className="receiverId"
            value={receiverId || ""}
            onChange={handleReceiverIdChange}
            placeholder="Enter Receiver ID"
            required
          />
          <h5>Enter Tokens Amount</h5>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <input
              type="number"
              className="sendTokens"
              min="0"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              placeholder="Enter Token Amount"
              required
            />
            <button
              className={`exin2 ${isClickable ? "clickable" : "unclickable"}`}
              onClick={handleMax}
            >
              Max
            </button>
          </div>

          <button type="button" className="transferbutton" onClick={handleOpen}>
            Send
          </button>
        </form>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <h3>Confirm Transfer</h3>
            <hr />
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h5>Sender: {userId}</h5>
              <h5>Receiver: {receiverId}</h5>
              <h5>Tokens: {inputValue}</h5>
              <p>Are you sure you want to send?</p>
            </div>
            <hr />
          </Typography>
          <Button onClick={ConfirmTransfer} color="success">
            Confirm
          </Button>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* New Congratulatory Modal */}
      {/* New Congratulatory Modal */}
      <Modal
        open={congratulationOpen}
        onClose={handleCongratulationClose}
        aria-labelledby="congratulation-modal-title"
        aria-describedby="congratulation-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="congratulation-modal-title"
            variant="h6"
            component="h2"
          >
            <h3>Congratulations!</h3>
            <hr />
          </Typography>
          <Typography id="congratulation-modal-description" sx={{ mt: 2 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <p>
                You have successfully sent {tempInputValue} tokens to{" "}
                {tempReceiverId}.
              </p>
              <p> {transferTimestamp}</p>
            </div>
            <hr />
          </Typography>
          <Button onClick={handleCongratulationClose} color="success">
            Exit
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Transfer;
