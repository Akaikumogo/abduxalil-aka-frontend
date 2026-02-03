import React from 'react';
import { motion } from 'framer-motion';

export function EmptyState({ message = "Ma'lumot yo'q", icon = "📭" }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-text">{message}</p>
    </motion.div>
  );
}

export function LoadingState({ message = "Yuklanmoqda..." }) {
  return (
    <motion.div
      className="loading-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-spinner-small"></div>
      <p>{message}</p>
    </motion.div>
  );
}

export default EmptyState;
