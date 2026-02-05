import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SPLASH_DURATION_MS = 2500;
const EXIT_DURATION_S = 0.5;

/**
 * Splash screen: oq fon, kattaroq logo/matn, minimalistik animatsiya.
 * Birinchi kirishda ko‘rsatiladi (sessionStorage orqali).
 */
export default function SplashScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION_S, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (exiting) onComplete?.();
      }}
    >
      <motion.div className="splash-content">
        <motion.div
          className="splash-logo-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <img
            src="SVG/gorizontal logo qizil mark,qora type.svg"
            alt="Buran Consulting"
            className="splash-logo"
          />
        </motion.div>
        <motion.h1
          className="splash-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          Buran Consulting
        </motion.h1>
        <motion.div
          className="splash-loader-track"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <motion.div
            className="splash-loader"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: SPLASH_DURATION_MS / 1000 - 0.35,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.35,
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
