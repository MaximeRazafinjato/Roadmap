import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import type { User } from '../../types/user-management';
import { useDeleteUser } from '../../hooks/useUsers';

interface UserDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({ open, onClose, user }) => {
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser.mutateAsync(user.id);
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        {deleteUser.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Une erreur est survenue lors de la suppression
          </Alert>
        )}

        <Typography>
          Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
          <strong>{user?.fullName || `${user?.firstName} ${user?.lastName}`}</strong> ?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleteUser.isPending}
        >
          {deleteUser.isPending ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
