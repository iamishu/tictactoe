import React, { useEffect, useState } from "react";
import "./tictactoe.css";
import GameCell from "./GameCell";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const TicTacToe = () => {
  const renderCells = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  const [gameState, setGameState] = useState(renderCells);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState();
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [playingAs, setPlayingAs] = useState(null);

  const checkWin = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // col dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") {
        return true;
      }
    });

    if (isDrawMatch) {
      return "draw";
    }

    return null;
  };

  const handlePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  useEffect(() => {
    const winner = checkWin();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  socket?.on("opponentLeftMatch", () => {
    setFinishetState("opponentLeftMatch");
  });

  socket?.on("PlayerMoveFromServer", function (data) {
    // setCurrentPlayer(data.state.sign);
    console.log(data);
    const id = data?.state?.id;
    setGameState((prevState) => {
      const newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data?.state?.sign;
      return newState;
    });
    if (!finishedState) {
      setCurrentPlayer(data?.state?.sign === "circle" ? "cross" : "circle");
    }
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    console.log("playingAs", data.playingAs);
    console.log("opponentName", data.opponentName);
    console.log("opponent found :", data);
    setOpponentName(data.opponentName);
    setPlayingAs(data.playingAs);
    console.log("playingAs", playingAs);
    console.log("opponentName", opponentName);
  });

  const playOnlineClick = async () => {
    const result = await handlePlayerName();
    if (!result.isConfirmed) {
      return;
    }
    const userName = result.value;
    setPlayerName(userName);

    const newSocket = io("http://localhost:3001", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: userName,
    });
    setSocket(newSocket);
  };

  if (!playOnline) {
    return (
      <div className="game-container">
        <button onClick={playOnlineClick} className="play-btn">
          Play Online
        </button>
      </div>
    );
  }
  if (playOnline && !opponentName) {
    return (
      <div className="game-container">
        <p className="waiting">Waiting for Opponent...</p>
      </div>
    );
  }
  return (
    <div className="game-container">
      <div className="players">
        <div
          className={`player circle ${
            currentPlayer === playingAs ? "active" : ""
          }`}
        >
          <span>{playerName}</span>
        </div>
        <div
          className={`player cross ${
            currentPlayer !== playingAs ? "active" : ""
          }`}
        >
          <span>{opponentName}</span>
        </div>
      </div>
      <h1 className="game-heading">Tic - Tac - Toe</h1>
      <div className="tictactoe">
        {gameState.map((arr, rowIndex) =>
          arr.map((e, colIndex) => {
            return (
              <GameCell
                socket={socket}
                gameState={gameState}
                setGameState={setGameState}
                id={rowIndex * 3 + colIndex}
                key={rowIndex * 3 + colIndex}
                currentPlayer={currentPlayer}
                setCurrentPlayer={setCurrentPlayer}
                finishedState={finishedState}
                finishedArrayState={finishedArrayState}
                currentElement={e}
                playingAs={playingAs}
              />
            );
          })
        )}
      </div>
      {/* {!startGame ? (
        <button className="restart-btn" onClick={() => start()}>
          Start
        </button>
      ) : (
        <button className="restart-btn" onClick={() => restart()}>
          Restart
        </button>
      )} */}
      {/* {startGame && ( */}
      {/* )} */}
      <div className="draw-box">
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <p>
              {finishedState === playingAs ? "You" : opponentName} won the game.
            </p>
          )}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState === "draw" && <p>It's a Draw.</p>}
        {!finishedState && opponentName && (
          <p>You are playing againts {opponentName}</p>
        )}
        {!finishedState && finishedState == "opponentLeftMatch" && (
          <p>You Won! {opponentName} left the Match.</p>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;
