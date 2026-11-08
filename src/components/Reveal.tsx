"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** One entrance for the whole site: same distance, duration and easing everywhere. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.12, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.9, ease: [0.22, 0.8, 0.24, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
