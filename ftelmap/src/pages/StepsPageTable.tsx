import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useSteps, useDeleteStep } from '../hooks/use-steps';
import StepForm from '../components/StepForm';
import type { Step } from '../types/entities';

const StepsPageTable = () => {
  const navigate = useNavigate();
  const { data: steps, isLoading, error } = useSteps();
  const deleteStep = useDeleteStep();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      await deleteStep.mutateAsync(id);
    }
  };

  const handleView = (id: string) => {
    navigate(`/steps/${id}`);
  };

  const handleEdit = (step: Step) => {
    setSelectedStep(step);
    setShowCreateForm(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter steps based on search term
  const filteredSteps = steps?.filter(step =>
    step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    step.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Paginate the filtered steps
  const paginatedSteps = filteredSteps.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Chargement des étapes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="error">Échec du chargement des étapes</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Étapes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Nouvelle Étape
        </Button>
      </Stack>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par titre, description ou lieu..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de début</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de fin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lieu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Participants</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Budget</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSteps.length > 0 ? (
              paginatedSteps.map((step) => (
                <TableRow
                  key={step.id}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell>
                    <Typography
                      fontWeight="medium"
                      sx={{
                        color: step.backgroundColor || 'primary.main',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {step.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {step.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(step.startDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {new Date(step.endDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {step.location || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {step.participants || '-'}
                  </TableCell>
                  <TableCell>
                    {step.budget ? `${step.budget.toLocaleString('fr-FR')} €` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Voir">
                        <IconButton
                          size="small"
                          onClick={() => handleView(step.id)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(step)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(step.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                  <Stack alignItems="center" spacing={2}>
                    <Typography variant="h6" color="text.secondary">
                      {filteredSteps.length === 0 && searchTerm
                        ? 'Aucune étape ne correspond à votre recherche'
                        : 'Aucune étape trouvée'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filteredSteps.length === 0 && !searchTerm
                        ? 'Créez votre première étape pour commencer !'
                        : 'Essayez de modifier votre recherche'}
                    </Typography>
                    {filteredSteps.length === 0 && !searchTerm ? (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowCreateForm(true)}
                        sx={{ mt: 2 }}
                      >
                        Créer une Étape
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={() => setSearchTerm('')}
                        sx={{ mt: 2 }}
                      >
                        Effacer la recherche
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredSteps.length > 0 && (
          <TablePagination
            component="div"
            count={filteredSteps.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        )}
      </TableContainer>

      {/* Step Form Modal */}
      {showCreateForm && (
        <StepForm
          step={selectedStep}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedStep(null);
          }}
        />
      )}
    </Box>
  );
};

export default StepsPageTable;