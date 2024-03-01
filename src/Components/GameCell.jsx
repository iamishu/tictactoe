import React, { useState } from "react";

const circleIcon = "&#x2B55;";
const crossIcon = "&#10060;";
const GameCell = ({
  socket,
  setGameState,
  id,
  gameState,
  currentPlayer,
  setCurrentPlayer,
  finishedState,
  finishedArrayState,
  currentElement,
  playingAs,
}) => {
  const [icon, setIcon] = useState(null);
  const handleClick = (e) => {
    if (playingAs !== currentPlayer) {
      return;
    }

    if (finishedState) {
      return;
    }

    if (!icon) {
      if (currentPlayer === "circle") {
        setIcon(circleIcon);
      } else {
        setIcon(crossIcon);
      }
      const myCurrentPlayer = currentPlayer;
      if (!finishedState) {
        setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");
      }

      socket?.emit("PlayerMoveFromClient", {
        state: {
          id,
          sign: currentPlayer,
        },
      });

      setGameState((prevState) => {
        const newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = myCurrentPlayer;
        return newState;
      });
    }
  };

  return (
    <div
      className={`cell ${finishedState ? "not-allowed" : ""} 
      ${currentPlayer !== playingAs ? "not-allowed" : ""} 
      ${finishedArrayState.includes(id) ? finishedState + "-win" : ""}`}
      onClick={(e) => handleClick(e)}
      dangerouslySetInnerHTML={{
        __html:
          currentElement === "circle"
            ? circleIcon
            : currentElement === "cross"
            ? crossIcon
            : icon,
      }}
    ></div>
  );
};

export default GameCell;
