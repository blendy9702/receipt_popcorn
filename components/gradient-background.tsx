"use client";

import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="absolute -left-[10%] -top-[10%] min-h-[120%] min-w-[120%]"
        style={{
          background:
            "linear-gradient(to top, #fad590 0%, #fce8c4 45%, #fef0db 100%)",
        }}
        animate={{
          y: [0, 5, -4, 0],
          x: [0, 2, -2, 0],
        }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
