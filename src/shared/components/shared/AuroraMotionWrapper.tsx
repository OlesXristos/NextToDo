'use client';

import { motion } from 'framer-motion';
import React from 'react';

export function AuroraMotionWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: 'easeInOut',
      }}
      className="relative min-h-screen">
      {children}
    </motion.div>
  );
}
