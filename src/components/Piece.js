import { motion } from "framer-motion";

function Piece({ src }) {
  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      whileHover={{
        scale: 1.08,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{
        duration: 0.15,
      }}
      style={{
        width: "70px",
        height: "70px",
        pointerEvents: "none",
      }}
    />
  );
}

export default Piece;