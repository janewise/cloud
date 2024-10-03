import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { isMobile } from "react-device-detect";
import "./upgradeButton.css";

interface ButtonProps {
  id: string;
  clickHandler: (id: string) => void;
  name: string;
  level: number;
  ads: string;
  cost: number;
  balance: number;
  increment: number;
  autoIncrementTotal: number;
  password: string[]; // Array of passwords for each day AM/PM
}

const buttonSX = {
  "&:hover": {
    borderColor: "rgb(255,255,255)",
    outline: "1px solid rgb(255,255,255)",
    backgroundColor: "rgba(60, 60, 60, 0.1)",
  },
  "&:disabled": {
    color: "rgb(185,185,185)",
  },
  "&:disabled:hover": {
    pointerEvents: "auto",
    cursor: "not-allowed",
  },
  color: "rgb(255,255,255)",
  borderColor: "rgb(223,223,223)",
  padding: "5px 0 5px 0",
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    align: "left",
    backgroundColor: "#0F0F0F",
    color: "rgba(255, 255, 255, 0.87)",
    maxWidth: 510,
    padding: "10px 10px 10px 10px",
    fontSize: theme.typography.pxToRem(8),
    border: "1px solid #dadde9",
  },
}));

const AdsCard: FunctionComponent<ButtonProps> = (props: ButtonProps) => {
  const [isVisited, setIsVisited] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [password, setPassword] = useState("");
  const [cooldownTimer, setCooldownTimer] = useState<number | null>(null);
  const [isIncorrectPassword, setIsIncorrectPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const savedCooldownTime = localStorage.getItem(`${props.id}-cooldown`);
    if (savedCooldownTime) {
      const remainingTime =
        Number(savedCooldownTime) - Math.floor(Date.now() / 1000);
      if (remainingTime > 0) {
        setIsCooldown(true);
        setCooldownTimer(remainingTime);
      }
    }
  }, [props.id]);

  useEffect(() => {
    if (isCooldown && cooldownTimer) {
      localStorage.setItem(
        `${props.id}-cooldown`,
        (Math.floor(Date.now() / 1000) + cooldownTimer).toString()
      );
      const interval = setInterval(() => {
        setCooldownTimer((prev) => prev! - 1);
      }, 1000);

      if (cooldownTimer <= 0) {
        setIsCooldown(false);
        setCooldownTimer(null);
        setIsVisited(false);
        localStorage.removeItem(`${props.id}-cooldown`);
      }

      return () => clearInterval(interval);
    }
  }, [isCooldown, cooldownTimer, props.id]);

  // Function to get the current password based on UTC time
  const getCurrentPassword = () => {
    const utcDay = new Date().getUTCDay(); // Day of the week (0 = Sunday, 6 = Saturday)
    const utcHours = new Date().getUTCHours(); // Hours (0-23)

    const isAM = utcHours < 12; // AM if before 12 PM
    const passwordIndex = utcDay * 2 + (isAM ? 0 : 1);

    return props.password[passwordIndex];
  };

  const handleClick = () => {
    if (!isVisited) {
      window.open(props.ads, "_blank");
      setIsVisited(true);
    } else if (isVisited && !isCooldown) {
      setIsPasswordDialogOpen(true);
    }
  };

  const handlePasswordSubmit = () => {
    const currentPassword = getCurrentPassword(); // Get the correct password based on UTC time
    if (password === currentPassword) {
      props.clickHandler(props.id);
      setIsCooldown(true);
      setCooldownTimer(43200); // 12 hours in seconds
      setIsPasswordDialogOpen(false);
      setIsIncorrectPassword(false);
    } else {
      setIsIncorrectPassword(true);
    }
  };

  const formatNumber = (n: number) => {
    if (n < 1e6) return n;
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "G";
    if (n >= 1e12 && n < 1e15) return +(n / 1e12).toFixed(1) + "T";
    if (n >= 1e15 && n < 1e18) return +(n / 1e15).toFixed(1) + "P";
    if (n >= 1e18 && n < 1e21) return +(n / 1e18).toFixed(1) + "E";
    if (n >= 1e21 && n < 1e24) return +(n / 1e21).toFixed(1) + "Z";
    if (n >= 1e24) return +(n / 1e24).toFixed(1) + "Y";
  };

  return (
    <div className="upgrade_box">
      <HtmlTooltip
        placement={isMobile ? "bottom" : "left"}
        title={
          <Typography variant="body2" align="left">
            {props.name} <br />
            Owned: {props.level} <br />
            <div
              style={{ display: props.level === 0 ? "none" : "inline-block" }}
            >
              <hr />
              {"Each " + props.name + " produces "}{" "}
              <b> {props.increment} balance </b> per second.
              <br />
              {props.level} {props.name} producing{" "}
              <b>
                {Math.round(props.level * props.increment * 100) / 100} balance{" "}
              </b>{" "}
              per second (
              {props.autoIncrementTotal !== 0 ? (
                <b>
                  {" "}
                  {Math.round(
                    ((props.level * props.increment) /
                      props.autoIncrementTotal) *
                      100 *
                      100
                  ) / 100}
                  %{" "}
                </b>
              ) : (
                <b>0%</b>
              )}{" "}
              of total BpS)
            </div>
          </Typography>
        }
      >
        <span
          style={{
            height: "70px",
            display: "inline-block",
            margin: "5px",
            padding: "0",
          }}
        >
          <Button
            variant="outlined"
            sx={buttonSX}
            style={{ display: isVisible ? "inline-block" : "none" }}
            id={props.id}
            disabled={isCooldown || props.balance < props.cost}
            className="upgradeButtonWidth upgradeButton"
            onClick={handleClick}
          >
            {props.name} <br />
            <hr />
            <p className="pricetext">
              {isCooldown
                ? `Level: ${props.level}: ${Math.floor(
                    cooldownTimer! / 3600
                  )}h ${Math.floor((cooldownTimer! % 3600) / 60)}m`
                : isVisited
                ? `Level: ${props.level} |  Cost: ${formatNumber(props.cost)}`
                : `Cost: ${formatNumber(props.cost)} | Ads`}
            </p>
          </Button>
        </span>
      </HtmlTooltip>

      <Dialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      >
        <DialogTitle>Enter Code from link</DialogTitle>
        <DialogContent style={{ overflowY: "visible" }}>
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isIncorrectPassword && (
            <h2 style={{ color: "red" }}>Incorrect Code</h2>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsPasswordDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handlePasswordSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdsCard;
