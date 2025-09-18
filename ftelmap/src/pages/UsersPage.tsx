import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useUsers, useUpdateUserStatus } from '../hooks/useUsers';
import { UserEditDialog } from '../components/users/UserEditDialog';
import { UserDeleteDialog } from '../components/users/UserDeleteDialog';
import type { User, UserFilters } from '../types/user-management';
import { useAuth } from '../hooks/use-auth-context';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useUsers();
  const updateUserStatus = useUpdateUserStatus();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    isActive: null,
    role: null,
    createdAtFrom: null,
    createdAtTo: null,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: User) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.email.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.isActive !== null) {
        if (user.isActive !== filters.isActive) return false;
      }

      // Role filter
      if (filters.role !== null) {
        if (user.role !== filters.role) return false;
      }

      // Date filters
      if (filters.createdAtFrom) {
        const userDate = dayjs(user.createdAt);
        if (userDate.isBefore(dayjs(filters.createdAtFrom), 'day')) return false;
      }

      if (filters.createdAtTo) {
        const userDate = dayjs(user.createdAt);
        if (userDate.isAfter(dayjs(filters.createdAtTo), 'day')) return false;
      }

      return true;
    });
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUserStatus.mutateAsync({
        id: user.id,
        data: { isActive: !user.isActive },
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.id === userId;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Une erreur est survenue lors du chargement des utilisateurs</Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <Box>
        <Typography variant="h4" gutterBottom>
          Gestion des utilisateurs
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Rechercher un utilisateur..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.isActive ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isActive: e.target.value === '' ? null : e.target.value === 'true',
                  })
                }
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={filters.role ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    role: e.target.value === '' ? null : e.target.value,
                  })
                }
                label="Rôle"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="User">Utilisateur</MenuItem>
                <MenuItem value="Admin">Administrateur</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Date de création (du)"
              value={filters.createdAtFrom ? dayjs(filters.createdAtFrom) : null}
              onChange={(newValue: Dayjs | null) =>
                setFilters({ ...filters, createdAtFrom: newValue?.toDate() || null })
              }
              slotProps={{
                textField: { size: 'medium' },
              }}
            />

            <DatePicker
              label="Date de création (au)"
              value={filters.createdAtTo ? dayjs(filters.createdAtTo) : null}
              onChange={(newValue: Dayjs | null) =>
                setFilters({ ...filters, createdAtTo: newValue?.toDate() || null })
              }
              slotProps={{
                textField: { size: 'medium' },
              }}
            />
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName || `${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'Admin' ? 'Administrateur' : 'Utilisateur'}
                      color={user.role === 'Admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <span>
                        <IconButton
                          onClick={() => setEditingUser(user)}
                          disabled={isCurrentUser(user.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title={user.isActive ? 'Désactiver' : 'Activer'}>
                      <span>
                        <IconButton
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrentUser(user.id) || updateUserStatus.isPending}
                          size="small"
                          color={user.isActive ? 'error' : 'success'}
                        >
                          {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                      <span>
                        <IconButton
                          onClick={() => setDeletingUser(user)}
                          disabled={isCurrentUser(user.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </TableContainer>

        <UserEditDialog
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
        />

        <UserDeleteDialog
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          user={deletingUser}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default UsersPage;
