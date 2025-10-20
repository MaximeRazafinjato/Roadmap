import { useCallback } from 'react';
import { useToast } from './useToast';

interface ErrorMessages {
  [key: string]: string;
}

// Messages d'erreur user-friendly basés sur les codes d'erreur HTTP
const httpErrorMessages: ErrorMessages = {
  '400': 'Les informations fournies sont incorrectes. Veuillez vérifier et réessayer.',
  '401': 'Votre session a expiré. Veuillez vous reconnecter.',
  '403': "Vous n'avez pas l'autorisation d'effectuer cette action.",
  '404': 'La ressource demandée est introuvable.',
  '409': "Cette action est en conflit avec l'état actuel. Veuillez actualiser la page.",
  '422': 'Les données fournies ne sont pas valides. Veuillez vérifier les champs.',
  '429': 'Trop de tentatives. Veuillez patienter avant de réessayer.',
  '500': 'Une erreur serveur est survenue. Nos équipes sont informées.',
  '502': 'Le serveur est temporairement indisponible. Veuillez réessayer.',
  '503': 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
  '504': 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
};

// Messages d'erreur pour des cas spécifiques
const specificErrorMessages: ErrorMessages = {
  ERR_NETWORK: 'Problème de connexion. Vérifiez votre connexion internet.',
  ERR_CONNECTION_REFUSED: 'Impossible de se connecter au serveur. Veuillez réessayer.',
  ERR_CONNECTION_TIMED_OUT: 'La connexion a expiré. Veuillez réessayer.',
  ERR_CANCELED: "L'opération a été annulée.",
  VALIDATION_ERROR: 'Veuillez vérifier les informations saisies.',
  DUPLICATE_ENTRY: 'Cette entrée existe déjà.',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  EMAIL_ALREADY_EXISTS: 'Cette adresse email est déjà utilisée.',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères.',
  INVALID_DATE_RANGE: 'La date de fin doit être après la date de début.',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10 MB).',
  INVALID_FILE_TYPE: 'Type de fichier non supporté.',
  QUOTA_EXCEEDED: 'Quota dépassé. Veuillez supprimer des éléments ou upgrader votre plan.',
};

export const useErrorHandler = () => {
  const toast = useToast();

  const getErrorMessage = useCallback((error: any): string => {
    // Si l'erreur a déjà un message user-friendly
    if (error?.userMessage) {
      return error.userMessage;
    }

    // Gestion des erreurs réseau axios
    if (error?.code && specificErrorMessages[error.code]) {
      return specificErrorMessages[error.code];
    }

    // Gestion des erreurs HTTP
    if (error?.response?.status) {
      const status = error.response.status.toString();

      // Vérifier d'abord si le serveur a envoyé un message d'erreur
      if (error.response.data?.message) {
        return error.response.data.message;
      }

      if (error.response.data?.error) {
        return error.response.data.error;
      }

      // Sinon utiliser le message par défaut pour ce code HTTP
      if (httpErrorMessages[status]) {
        return httpErrorMessages[status];
      }
    }

    // Gestion des erreurs de validation du serveur
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }

    // Gestion des erreurs JavaScript standards
    if (error?.message) {
      // Traduire certains messages d'erreur techniques
      if (error.message.includes('Network Error')) {
        return specificErrorMessages['ERR_NETWORK'];
      }
      if (error.message.includes('timeout')) {
        return specificErrorMessages['ERR_CONNECTION_TIMED_OUT'];
      }

      // Pour le développement, afficher le message original
      if (process.env.NODE_ENV === 'development') {
        return error.message;
      }
    }

    // Message par défaut
    return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }, []);

  const handleError = useCallback(
    (error: any, options?: { silent?: boolean; fallbackMessage?: string }) => {
      const message = options?.fallbackMessage || getErrorMessage(error);

      if (!options?.silent) {
        toast.error(message);
      }

      // Logger l'erreur en développement
      if (process.env.NODE_ENV === 'development') {
        console.error('Error handled:', error);
      }

      return message;
    },
    [getErrorMessage, toast]
  );

  const handleAsyncError = useCallback(
    async (promise: Promise<any>, options?: { silent?: boolean; fallbackMessage?: string }) => {
      try {
        return await promise;
      } catch (error) {
        handleError(error, options);
        throw error;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    getErrorMessage,
  };
};
