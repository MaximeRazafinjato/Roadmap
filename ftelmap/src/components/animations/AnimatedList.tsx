import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode[];
}

const listVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const AnimatedList = ({ children }: AnimatedListProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={listVariants}
      style={{ width: '100%' }}
    >
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={itemVariants}
            layout
            layoutId={`item-${index}`}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
