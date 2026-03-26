import { motion } from "framer-motion";

export function VoicePulseOverlay() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-[#ff2442]/50 bg-[#ff2442]/10"
          style={{ width: 120 + i * 90, height: 120 + i * 90 }}
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 1.4 + i * 0.2, opacity: 0 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.45,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.p
        className="relative z-[1] rounded-2xl bg-white/90 px-5 py-3 text-sm font-bold text-zinc-800 shadow-lg backdrop-blur-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        正在聆听…（语音问地图 Mock）
      </motion.p>
    </motion.div>
  );
}
