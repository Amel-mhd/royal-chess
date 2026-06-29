import { useState } from "react";
import Piece from "./Piece";

import wP from "../assets/pieces/wP.svg";
import wR from "../assets/pieces/wR.svg";
import wN from "../assets/pieces/wN.svg";
import wB from "../assets/pieces/wB.svg";
import wQ from "../assets/pieces/wQ.svg";
import wK from "../assets/pieces/wK.svg";

import bP from "../assets/pieces/bP.svg";
import bR from "../assets/pieces/bR.svg";
import bN from "../assets/pieces/bN.svg";
import bB from "../assets/pieces/bB.svg";
import bQ from "../assets/pieces/bQ.svg";
import bK from "../assets/pieces/bK.svg";

function Board({ game, onPlayerMove, isAiThinking }) {
  const [selectedSquare, setSelectedSquare] = useState(null);

  const files = "abcdefgh";
  const position = game.board();

  const pieces = {
    wp: wP, wr: wR, wn: wN, wb: wB, wq: wQ, wk: wK,
    bp: bP, br: bR, bn: bN, bb: bB, bq: bQ, bk: bK,
  };

  const getSquareName = (row, col) => {
    return files[col] + (8 - row);
  };

  const legalMoves = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  const handleClick = (row, col) => {
    if (isAiThinking) return; // Bloque l'échiquier pendant que Stockfish réfléchit

    const square = getSquareName(row, col);

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    onPlayerMove(selectedSquare, square);
    setSelectedSquare(null);
  };

  const board = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const squareName = getSquareName(row, col);
      const square = position[row][col];
      const isDark = (row + col) % 2 === 1;
      const isSelected = selectedSquare === squareName;
      const isLegalMove = legalMoves.some((move) => move.to === squareName);

      board.push(
        <div
          key={squareName}
          onClick={() => handleClick(row, col)}
          style={{
            width: "80px",
            height: "80px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: isAiThinking ? "not-allowed" : "pointer",
            backgroundColor: isDark ? "#5C3B28" : "#E8D8C3",
            border: isSelected ? "3px solid #C4A882" : "1px solid transparent",
            boxSizing: "border-box",
            transition: "0.15s",
          }}
        >
          {isLegalMove && !square && (
            <div style={{ position: "absolute", width: "20px", height: "20px", borderRadius: "50%", background: "rgba(0,0,0,0.25)", pointerEvents: "none" }} />
          )}

          {isLegalMove && square && (
            <div style={{ position: "absolute", inset: "4px", border: "4px solid rgba(0,0,0,0.25)", borderRadius: "50%", pointerEvents: "none", zIndex: 1 }} />
          )}

          {square && <Piece src={pieces[square.color + square.type]} />}

          {col === 0 && <span style={{ position: "absolute", left: 4, top: 4, fontSize: 10, fontWeight: "bold", opacity: 0.7 }}>{8 - row}</span>}
          {row === 7 && <span style={{ position: "absolute", right: 4, bottom: 4, fontSize: 10, fontWeight: "bold", opacity: 0.7 }}>{files[col]}</span>}
        </div>
      );
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 80px)", border: "6px solid #C4A882", borderRadius: "12px", overflow: "hidden", boxShadow: "0 0 60px rgba(196,168,130,.2)" }}>
      {board}
    </div>
  );
}

export default Board;