import { useState } from "react";
import Game from "./components/Game";

function App() {
  const [started, setStarted] = useState(false);
  const [timeControl, setTimeControl] = useState(10);
  const [gameMode, setGameMode] = useState("ai"); // 'ai' ou 'friend' par défaut
  const [aiDepth, setAiDepth] = useState(10);

  if (started) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at center, #1a120c 0%, #0a0a0a 70%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* On passe le mode et le temps choisis au composant Game */}
        <Game initialTime={timeControl * 60} initialMode={gameMode} onQuit={() => setStarted(false)} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at center, #1a120c 0%, #0a0a0a 70%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#F5F0E8",
      }}
    >
      <div
        style={{
          width: "500px",
          background: "rgba(17,17,17,.8)",
          border: "1px solid rgba(196,168,130,.2)",
          borderRadius: "20px",
          padding: "50px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 80px rgba(196,168,130,.15)",
        }}
      >
        <p
          style={{
            color: "#C4A882",
            letterSpacing: "4px",
            marginBottom: "10px",
          }}
        >
          AI POWERED CHESS EXPERIENCE
        </p>

        <h1
          style={{
            fontSize: "64px",
            margin: 0,
            letterSpacing: "4px",
          }}
        >
          ROYAL CHESS
        </h1>

        <p
          style={{
            opacity: 0.7,
            marginTop: "20px",
            lineHeight: 1.7,
          }}
        >
          Défiez vos amis, améliorez votre stratégie et préparez-vous à affronter une IA redoutable.
        </p>

        {/* AJOUT : CHOIX DU MODE DE JEU */}
        <h3 style={{ marginTop: "30px", color: "#C4A882" }}>
          Choisissez votre adversaire
        </h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "15px" }}>
          <button
            onClick={() => setGameMode("friend")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              border: gameMode === "friend" ? "2px solid #C4A882" : "1px solid rgba(255,255,255,.1)",
              background: gameMode === "friend" ? "#C4A882" : "#111",
              color: gameMode === "friend" ? "#111" : "#F5F0E8",
            }}
          >
            👥 Contre un ami
          </button>
          <button
            onClick={() => setGameMode("ai")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
              border: gameMode === "ai" ? "2px solid #C4A882" : "1px solid rgba(255,255,255,.1)",
              background: gameMode === "ai" ? "#C4A882" : "#111",
              color: gameMode === "ai" ? "#111" : "#F5F0E8",
            }}
          >
            💻 Stockfish Bot
          </button>
        </div>

        {gameMode === "ai" && (
  <div
    style={{
      marginTop: "20px",
    }}
  >
    <h3 style={{ color: "#C4A882" }}>
      Difficulté de l'IA
    </h3>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
      }}
    >
      {[5, 10, 15].map((level) => (
        <button
          key={level}
          onClick={() => setAiDepth(level)}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "700",
            border:
              aiDepth === level
                ? "2px solid #C4A882"
                : "1px solid rgba(255,255,255,.1)",
            background:
              aiDepth === level
                ? "#C4A882"
                : "#111",
            color:
              aiDepth === level
                ? "#111"
                : "#F5F0E8",
          }}
        >
          {level === 5
            ? "😊 Facile"
            : level === 10
            ? "😐 Moyen"
            : "🔥 Difficile"}
        </button>
      ))}
    </div>
  </div>
)}

        {/* CHOIX LA CADENCE */}
        <h3 style={{ marginTop: "30px", color: "#C4A882" }}>
          Choisissez votre cadence
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          {[1,3, 5, 10, 15].map((time) => (
            <button
              key={time}
              onClick={() => setTimeControl(time)}
              style={{
                padding: "12px 20px",
                border:
                  timeControl === time
                    ? "2px solid #C4A882"
                    : "1px solid rgba(255,255,255,.1)",
                background:
                  timeControl === time
                    ? "#C4A882"
                    : "#111",
                color:
                  timeControl === time
                    ? "#111"
                    : "#F5F0E8",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {time} min
            </button>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          style={{
            marginTop: "40px",
            padding: "16px 40px",
            background: "#C4A882",
            color: "#111",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "700",
            width: "100%",
          }}
        >
          Jouer ⚔️
        </button>
      </div>
    </div>
  );
}

export default App;