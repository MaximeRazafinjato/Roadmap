import { motion, Variants } from 'framer-motion';
import { Card, CardProps } from '@mui/material';
import { forwardRef, ReactNode } from 'react';

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  delay?: number;
  hoverable?: boolean;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const hoverVariants: Variants = {
  hover: {
    scale: 1.02,
    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

const MotionCard = motion(Card);

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, delay = 0, hoverable = false, ...props }, ref) => {
    return (
      <MotionCard
        ref={ref}
        custom={delay}
        initial="hidden"
        animate="visible"
        whileHover={hoverable ? 'hover' : undefined}
        variants={{ ...cardVariants, ...(hoverable ? hoverVariants : {}) }}
        {...props}
      >
        {children}
      </MotionCard>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
