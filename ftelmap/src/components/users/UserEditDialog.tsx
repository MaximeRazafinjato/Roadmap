import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { User, UpdateUserRequest } from '../../types/user-management';
import { useUpdateUser } from '../../hooks/useUsers';

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const updateUser = useUpdateUser();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateUserRequest>({
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      role: 'User',
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'User',
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserRequest) => {
    if (!user) return;

    try {
      await updateUser.mutateAsync({ id: user.id, data });
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier l'utilisateur</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {updateUser.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Une erreur est survenue lors de la mise à jour
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="username"
              control={control}
              rules={{ required: "Le nom d'utilisateur est requis" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nom d'utilisateur"
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              )}
            />

            <Controller
              name="firstName"
              control={control}
              rules={{ required: 'Le prénom est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Prénom"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              rules={{ required: 'Le nom est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nom"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Rôle</InputLabel>
                  <Select {...field} label="Rôle">
                    <MenuItem value="User">Utilisateur</MenuItem>
                    <MenuItem value="Admin">Administrateur</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Compte actif"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};