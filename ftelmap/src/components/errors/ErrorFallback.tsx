import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { motion } from 'framer-motion';

interface ErrorFallbackProps {
  error?: Error | string;
  resetErrorBoundary?: () => void;
  type?: 'network' | 'validation' | 'server' | 'generic';
  retry?: () => void;
}

const errorIcons = {
  network: WifiOffIcon,
  validation: ErrorOutlineIcon,
  server: ErrorOutlineIcon,
  generic: ErrorOutlineIcon,
};

const errorTitles = {
  network: 'Problème de connexion',
  validation: 'Données invalides',
  server: 'Erreur serveur',
  generic: 'Une erreur est survenue',
};

const errorMessages = {
  network: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.',
  validation:
    'Les données fournies ne sont pas valides. Veuillez vérifier les informations saisies.',
  server: 'Le serveur rencontre des difficultés. Nos équipes sont informées du problème.',
  generic: "Une erreur inattendue s'est produite. Veuillez réessayer dans quelques instants.",
};

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
  type = 'generic',
  retry,
}: ErrorFallbackProps) => {
  const Icon = errorIcons[type];
  const title = errorTitles[type];
  const message = errorMessages[type];

  const handleRetry = () => {
    if (retry) {
      retry();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          p: 4,
          textAlign: 'center',
        }}
      >
        <Icon
          sx={{
            fontSize: 64,
            color: 'error.main',
            mb: 2,
            opacity: 0.7,
          }}
        />

        <Typography variant="h5" gutterBottom fontWeight="600">
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          {message}
        </Typography>

        {process.env.NODE_ENV === 'development' && error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, textAlign: 'left' }}>
            <AlertTitle>Détails de l'erreur (dev)</AlertTitle>
            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
              {typeof error === 'string' ? error : error.message}
            </Typography>
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{ borderRadius: 2 }}
        >
          Réessayer
        </Button>
      </Box>
    </motion.div>
  );
};
