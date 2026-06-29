import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import Board from "./Board";

// Importations des pièces blanches
import wP from "../assets/pieces/wP.svg";
import wR from "../assets/pieces/wR.svg";
import wN from "../assets/pieces/wN.svg";
import wB from "../assets/pieces/wB.svg";
import wQ from "../assets/pieces/wQ.svg";

// Importations des pièces noires
import bP from "../assets/pieces/bP.svg";
import bR from "../assets/pieces/bR.svg";
import bN from "../assets/pieces/bN.svg";
import bB from "../assets/pieces/bB.svg";
import bQ from "../assets/pieces/bQ.svg";

// Importations des sons
import moveSoundFile from "../assets/sounds/move.mp3";
import captureSoundFile from "../assets/sounds/capture.mp3";
import checkSoundFile from "../assets/sounds/check.mp3";

function Game({ initialTime = 600, initialMode = "ai" }) {
  const [game, setGame] = useState(new Chess());
  const [chosenInitialTime, setChosenInitialTime] = useState(initialTime);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameMode, setGameMode] = useState(initialMode); 
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeWinner, setTimeWinner] = useState(null);
  const [aiDepth, setAiDepth] = useState(10);
  const [promotionMove, setPromotionMove] = useState(null);

  // Références pour jouer les sons sans décalage
  const audioMove = useRef(new Audio(moveSoundFile));
  const audioCapture = useRef(new Audio(captureSoundFile));
  const audioCheck = useRef(new Audio(checkSoundFile));

  // Référence pour l'auto-scroll de l'historique
  const historyEndRef = useRef(null);

  // Fonction centrale pour jouer le bon son selon le coup
  const playSound = (moveResult) => {
    if (game.inCheck() || game.isCheckmate()) {
      audioCheck.current.currentTime = 0;
      audioCheck.current.play().catch(() => {});
    } else if (moveResult && moveResult.captured) {
      audioCapture.current.currentTime = 0;
      audioCapture.current.play().catch(() => {});
    } else {
      audioMove.current.currentTime = 0;
      audioMove.current.play().catch(() => {});
    }
  };

  // Synchronise le jeu si l'accueil change
  useEffect(() => {
    setChosenInitialTime(initialTime);
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setGameMode(initialMode);
    const newGameInstance = new Chess();
    setGame(newGameInstance);
    setMoveHistory([]); // Reset complet de l'historique au changement de config
    setIsAiThinking(false);
  }, [initialTime, initialMode]);

  // Auto-scroll de l'historique vers le bas à chaque nouveau coup
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [moveHistory]);

  // Gestion du coup du joueur humain
  const handlePlayerMove = (from, to) => {
  const piece = game.get(from);

  const isPromotion =
    piece &&
    piece.type === "p" &&
    ((piece.color === "w" && to[1] === "8") ||
      (piece.color === "b" && to[1] === "1"));

  if (isPromotion) {
    setPromotionMove({ from, to });
    return;
  }

  const gameCopy = new Chess(game.fen());

  try {
    const move = gameCopy.move({ from, to });

    if (move) {
      playSound(move, gameCopy);
      setGame(gameCopy);
      setMoveHistory((prev) => [...prev, move]);
    }
  } catch (e) {
    // Coup invalide
  }
};

const choosePromotion = (promotion) => {
  if (!promotionMove) return;

  const gameCopy = new Chess(game.fen());

  try {
    const move = gameCopy.move({
      from: promotionMove.from,
      to: promotionMove.to,
      promotion,
    });

    if (move) {
      playSound(move, gameCopy);
      setGame(gameCopy);
      setMoveHistory((prev) => [...prev, move]);
    }
  } catch (e) {
    // Coup invalide
  }

  setPromotionMove(null);
};

  // API Stockfish
  useEffect(() => {
    if (gameMode === "ai" && game.turn() === "b" && !game.isGameOver() && !isAiThinking) {
      setIsAiThinking(true);
      const fen = encodeURIComponent(game.fen());
      
      fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${aiDepth}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.success && data.bestmove) {
            const bestMoveString = data.bestmove.split(" ")[1];
            const from = bestMoveString.substring(0, 2);
            const to = bestMoveString.substring(2, 4);
            const promotion = bestMoveString.length === 5 ? bestMoveString.charAt(4) : "q";

            const gameCopy = new Chess(game.fen());
            const move = gameCopy.move({ from, to, promotion });

            if (move) {
              playSound(move); // Joue le son du coup de l'IA
              setGame(gameCopy);
              // FIX : On ajoute le coup de l'IA à la suite de l'historique
              setMoveHistory((prev) => [...prev, move]);
            }
          }
          setIsAiThinking(false);
        })
        .catch((error) => {
          console.error("Erreur Stockfish:", error);
          setIsAiThinking(false);
        });
    }
  }, [game, gameMode, isAiThinking, aiDepth]);

  // Génère les paires de coups pour l'affichage tableau de l'historique
  const renderHistoryPairs = () => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moveHistory[i]?.san || "",
        black: moveHistory[i + 1]?.san || "",
      });
    }
    return pairs;
  };

  const historyPairs = renderHistoryPairs();

  const capturedBlackPieces = { p: bP, r: bR, n: bN, b: bB, q: bQ };
  const capturedWhitePieces = { p: wP, r: wR, n: wN, b: wB, q: wQ };

  const capturedByWhite = moveHistory.filter((move) => move.captured && move.color === "w");
  const capturedByBlack = moveHistory.filter((move) => move.captured && move.color === "b");

  const restartGame = (newTime = chosenInitialTime, newMode = gameMode) => {
    const newGameInstance = new Chess();
    setGame(newGameInstance);
    setMoveHistory([]); // Reset complet de l'historique
    setIsAiThinking(false);
    setWhiteTime(newTime);
    setBlackTime(newTime);
    setGameMode(newMode);
    setTimeWinner(null);
  };

  const handleTimeChange = (e) => {
    const newSeconds = Number(e.target.value);
    setChosenInitialTime(newSeconds);
    restartGame(newSeconds, gameMode);
  };

  // Chronomètres
  useEffect(() => {
    const interval = setInterval(() => {
      if (game.isGameOver() || timeWinner) return;

     if (game.turn() === "w") {
  setWhiteTime((prev) => {
    if (prev <= 1) {
      setTimeWinner("Noirs");
      return 0;
    }
    return prev - 1;
  });
} else {
  setBlackTime((prev) => {
    if (prev <= 1) {
      setTimeWinner("Blancs");
      return 0;
    }
    return prev - 1;
  });
}

    }, 1000);

    return () => clearInterval(interval);
  }, [game]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isCheck = game.inCheck() && !game.isGameOver();
  const winner = game.isCheckmate() ? (game.turn() === "w" ? "Noirs (Par Échec et Mat)" : "Blancs (Par Échec et Mat)") : null;
  const isDraw = game.isDraw() || game.isStalemate() || game.isThreefoldRepetition();


  const promotionButtonStyle = {
  padding: "14px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#C4A882",
  color: "#111",
  fontWeight: "800",
  cursor: "pointer",
  fontSize: "15px",
};

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", position: "relative" }}>
      
      {/* INDICATEUR EN CAS D'ÉCHEC SIMPLE */}
      {isCheck && (
        <div style={{ position: "absolute", top: "-15px", background: "#8b0000", color: "#fff", padding: "6px 20px", borderRadius: "20px", fontSize: "14px", fontWeight: "800", letterSpacing: "2px", boxShadow: "0 0 15px rgba(139,0,0,0.6)", animation: "pulse 1.5s infinite", textTransform: "uppercase" }}>
          ⚠️ Échec au Roi !
        </div>
      )}

      <div style={{ display: "flex", gap: "80px", alignItems: "stretch", justifyContent: "center", maxWidth: "100%" }}>
        
        {/* COLONNE GAUCHE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "640px", boxSizing: "border-box" }}>
          
          {/* BANDEAU NOIR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxSizing: "border-box", width: "100%", height: "45px" }}>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: "#C4A882", fontSize: "12px", marginRight: "6px", opacity: 0.6 }}>Capturées :</span>
              {capturedByWhite.map((move, index) => (
                <img key={index} src={capturedBlackPieces[move.captured]} alt="" style={{ width: "22px", height: "22px" }} />
              ))}
            </div>
            <div style={{ color: "#F5F0E8", fontSize: "18px", fontWeight: "700" }}>
              {isAiThinking && gameMode === "ai" ? "♚ 💭" : "♚"} {formatTime(blackTime)}
            </div>
          </div>

          {/* L'ÉCHIQUIER */}
          <div style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.6)", borderRadius: "4px", overflow: "hidden", width: "640px", height: "640px" }}>
            <Board game={game} onPlayerMove={handlePlayerMove} isAiThinking={isAiThinking} />
          </div>

          {/* BANDEAU BLANC */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxSizing: "border-box", width: "100%", height: "45px" }}>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: "#C4A882", fontSize: "12px", marginRight: "6px", opacity: 0.6 }}>Capturées :</span>
              {capturedByBlack.map((move, index) => (
                <img key={index} src={capturedWhitePieces[move.captured]} alt="" style={{ width: "22px", height: "22px" }} />
              ))}
            </div>
            <div style={{ color: "#F5F0E8", fontSize: "18px", fontWeight: "700" }}>
              ♔ {formatTime(whiteTime)}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px" }}>
          
          <div style={{ display: "flex", gap: "8px", background: "#111", padding: "6px", borderRadius: "8px", border: "1px solid rgba(196,168,130,.15)" }}>
            <button
              onClick={() => restartGame(chosenInitialTime, "friend")}
              style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px", background: gameMode === "friend" ? "#C4A882" : "transparent", color: gameMode === "friend" ? "#111" : "#A8A297", transition: "all 0.2s" }}
            >
              👥 Ami
            </button>
            <button
              onClick={() => restartGame(chosenInitialTime, "ai")}
              style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px", background: gameMode === "ai" ? "#C4A882" : "transparent", color: gameMode === "ai" ? "#111" : "#A8A297", transition: "all 0.2s" }}
            >
              💻 Stockfish
            </button>
          </div>

          <div style={{ background: "#111", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(196,168,130,.15)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ color: "#C4A882", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Cadence</label>
            <select
              value={chosenInitialTime}
              onChange={handleTimeChange}
              style={{ width: "100%", padding: "6px", borderRadius: "4px", background: "#222", color: "#F5F0E8", border: "1px solid rgba(196,168,130,.3)", fontWeight: "600", outline: "none", cursor: "pointer" }}
            >
              <option value={60}> 1 minute (Bullet)</option>
              <option value={180}>3 minutes (Blitz)</option>
              <option value={300}>5 minutes (Blitz)</option>
              <option value={600}>10 minutes (Rapide)</option>
              <option value={900}>15 minutes (Rapide)</option>
              <option value={1800}>30 minutes (Classique)</option>
            </select>
          </div>

          {/* HISTORIQUE CORRIGÉ AVEC AUTO-SCROLL */}
          <div style={{ flex: 1, background: "#111", border: "1px solid rgba(196,168,130,.15)", borderRadius: "8px", padding: "15px", color: "#F5F0E8", display: "flex", flexDirection: "column", boxSizing: "border-box", maxHeight: "380px" }}>
            <h2 style={{ color: "#C4A882", marginTop: 0, marginBottom: "12px", fontSize: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "5px" }}>
              Historique
            </h2>
            
            {historyPairs.length === 0 ? (
              <p style={{ opacity: 0.4, fontStyle: "italic", fontSize: "13px", margin: "auto 0", textAlign: "center" }}>Aucun coup joué</p>
            ) : (
              <div style={{ overflowY: "auto", paddingRight: "5px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                {historyPairs.map((pair, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", fontSize: "14px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,.02)" }}>
                    <span style={{ color: "#C4A882", fontWeight: "600" }}>{pair.moveNumber}.</span>
                    <span style={{ color: "#F5F0E8" }}>{pair.white}</span>
                    <span style={{ color: "#A8A297" }}>{pair.black}</span>
                  </div>
                ))}
                {/* Élément invisible qui sert d'ancre pour descendre l'historique */}
                <div ref={historyEndRef} />
              </div>
            )}
          </div>

          <button onClick={() => restartGame()} style={{ padding: "14px", background: "#C4A882", color: "#111", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", width: "100%" }}>
            Nouvelle Partie
          </button>
        </div>
      </div>

      {/* MODALS FIN DE PARTIE */}

      {promotionMove && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
    <div style={{ background: "#111", border: "3px solid #C4A882", borderRadius: "20px", padding: "35px", color: "#F5F0E8", textAlign: "center" }}>
      <h2 style={{ color: "#C4A882", marginTop: 0 }}>
        Promotion du pion
      </h2>

      <p>Choisis ta nouvelle pièce :</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button onClick={() => choosePromotion("q")} style={promotionButtonStyle}>♕ Dame</button>
        <button onClick={() => choosePromotion("r")} style={promotionButtonStyle}>♖ Tour</button>
        <button onClick={() => choosePromotion("b")} style={promotionButtonStyle}>♗ Fou</button>
        <button onClick={() => choosePromotion("n")} style={promotionButtonStyle}>♘ Cavalier</button>
      </div>
    </div>
  </div>
)}

      {timeWinner && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(6px)" }}>
    <div style={{ background: "#111", border: "3px solid #C4A882", borderRadius: "25px", padding: "50px 70px", color: "#F5F0E8", textAlign: "center", boxShadow: "0 0 50px rgba(196,168,130,0.4)" }}>
      <h1 style={{ color: "#C4A882", margin: "0 0 10px 0", fontSize: "32px" }}>
        ⏰ TEMPS ÉCOULÉ
      </h1>

      <h2 style={{ color: "#fff", margin: "0 0 30px 0", fontWeight: "400" }}>
        Victoire des {timeWinner}
      </h2>

      <button
        onClick={() => restartGame()}
        style={{ padding: "14px 28px", border: "none", borderRadius: "8px", background: "#C4A882", color: "#111", fontWeight: "800", cursor: "pointer", fontSize: "16px", textTransform: "uppercase" }}
      >
        Rejouer
      </button>
    </div>
  </div>
)}


      {winner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(6px)" }}>
          <div style={{ background: "#111", border: "3px solid #C4A882", borderRadius: "25px", padding: "50px 70px", color: "#F5F0E8", textAlign: "center", boxShadow: "0 0 50px rgba(196,168,130,0.4)" }}>
            <h1 style={{ color: "#C4A882", margin: "0 0 10px 0", fontSize: "32px" }}> 👑 FIN DE PARTIE 👑 </h1>
            <h2 style={{ color: "#fff", margin: "0 0 30px 0", fontWeight: "400" }}>Victoire des {winner}</h2>
            <button onClick={() => restartGame()} style={{ padding: "14px 28px", border: "none", borderRadius: "8px", background: "#C4A882", color: "#111", fontWeight: "800", cursor: "pointer", fontSize: "16px", textTransform: "uppercase" }}>Rejouer</button>
          </div>
        </div>
      )}

      {isDraw && !winner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(6px)" }}>
          <div style={{ background: "#111", border: "3px solid #A8A297", borderRadius: "25px", padding: "50px 70px", color: "#F5F0E8", textAlign: "center" }}>
            <h1 style={{ color: "#A8A297", margin: "0 0 10px 0", fontSize: "32px" }}>🤝 MATCH NUL 🤝</h1>
            <h2 style={{ color: "#fff", margin: "0 0 30px 0", fontWeight: "400" }}>Partie terminée par nulle (Pat ou Répétition)</h2>
            <button onClick={() => restartGame()} style={{ padding: "14px 28px", border: "none", borderRadius: "8px", background: "#A8A297", color: "#111", fontWeight: "800", cursor: "pointer", fontSize: "16px" }}>Rejouer</button>
          </div>
        </div>
      )}

      {/* Style CSS inline pour l'animation du petit bandeau Échec */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default Game;