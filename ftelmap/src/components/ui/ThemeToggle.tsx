import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const MotionIconButton = motion(IconButton);

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Basculer vers le mode ${mode === 'light' ? 'sombre' : 'clair'}`}>
      <MotionIconButton
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          color: 'inherit',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: mode === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {mode === 'light' ? (
            <DarkModeIcon sx={{ fontSize: 20 }} />
          ) : (
            <LightModeIcon sx={{ fontSize: 20 }} />
          )}
        </motion.div>
      </MotionIconButton>
    </Tooltip>
  );
};
