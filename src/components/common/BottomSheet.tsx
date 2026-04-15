import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BottomSheet.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className="bottom-sheet-container"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
          >
            <div className="bottom-sheet-header">
              <div className="bottom-sheet-handle" />
              {title && <h2 className="bottom-sheet-title">{title}</h2>}
            </div>
            <div className="bottom-sheet-content">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
