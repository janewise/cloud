import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/click.png";

export function ClickHandler(props: {
  balanceRef: React.MutableRefObject<{ value: number }>;
  increment: number;
  energy: number;
  maxEnergy: number;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [texts, setTexts] = useState<
    Array<{
      value: string;
      position: { x: number; y: number };
      opacity: number;
    }>
  >([]);
  const touchPoints = useRef(new Set<number>()); // To track active touch points

  const fadeOutText = (index: number) => {
    setTexts((prevTexts) =>
      prevTexts.map((text, i) => (i === index ? { ...text, opacity: 0 } : text))
    );
  };

  const handleClickText = (x: number, y: number) => {
    const newText = {
      value: `+${props.increment}`,
      position: { x, y },
      opacity: 1,
    };
    setTexts((prevTexts) => [...prevTexts, newText]);
  };

  const handleClick = () => {
    if (props.energy >= props.increment) {
      props.balanceRef.current.value =
        Math.round((props.balanceRef.current.value + props.increment) * 100) /
        100;
      props.setEnergy((prevEnergy) => prevEnergy - props.increment);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLImageElement>) => {
    event.preventDefault();
    Array.from(event.changedTouches).forEach((touch) =>
      touchPoints.current.add(touch.identifier)
    );
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLImageElement>) => {
    event.preventDefault();
    Array.from(event.changedTouches).forEach((touch) => {
      const { clientX, clientY } = touch;
      handleClick();
      handleClickText(clientX, clientY);
      touchPoints.current.delete(touch.identifier);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTexts((prevTexts) =>
        prevTexts.map((text) => ({
          ...text,
          position: { ...text.position, y: text.position.y - 1 },
        }))
      );
    }, 10);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 500);

    if (texts.length > 0) {
      const lastTextIndex = texts.length - 1;
      setTimeout(() => {
        fadeOutText(lastTextIndex);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [texts]);

  return (
    <>
      <img
        onClick={(e) => {
          handleClick();
          handleClickText(e.clientX, e.clientY);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        src={logo}
        alt="logo"
        className="logoImg"
        title="Click me!"
        draggable="false"
        style={{ userSelect: "none" }}
      />
      {texts.map((text, index) => (
        <div
          key={index}
          style={{
            color: "#fff",
            fontSize: "40px",
            position: "absolute",
            top: text.position.y - 30,
            left: text.position.x - 16,
            padding: "5px",
            zIndex: 9999,
            pointerEvents: "none",
            transition: "opacity 0.5s ease",
            opacity: text.opacity,
          }}
        >
          {text.value}
        </div>
      ))}
      <div
        style={{
          position: "relative",
          bottom: -13,
          color: " #ffffffbe",
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: 2,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="gold"
          className="bi bi-lightning-fill"
          viewBox="0 0 16 16"
        >
          <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z" />
        </svg>{" "}
        <span></span>
        {props.energy}/{props.maxEnergy}
      </div>
    </>
  );
}
