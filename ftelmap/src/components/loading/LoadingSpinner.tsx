import { CircularProgress, Box, Typography } from '@mui/material';
import { motion, Variants } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const messageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.5,
    },
  },
};

export const LoadingSpinner = ({ size = 40, message, fullScreen = false }: LoadingSpinnerProps) => {
  const content = (
    <motion.div initial="initial" animate="animate" variants={containerVariants}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: 'linear',
          }}
        >
          <CircularProgress size={size} />
        </motion.div>
        {message && (
          <motion.div variants={messageVariants}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
      }}
    >
      {content}
    </Box>
  );
};
