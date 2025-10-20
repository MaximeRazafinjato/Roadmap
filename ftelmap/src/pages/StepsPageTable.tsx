import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  Tooltip,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSteps, useDeleteStep } from '../hooks/use-steps';
import StepForm from '../components/StepForm';
import { PageLayout } from '../components/PageLayout';
import type { Step } from '../types/entities';
import { RichTextViewer } from '../components/RichTextViewer';
import { stripHtmlTags } from '../utils/html-utils';
import { getDepartmentLabel, getDepartmentColor } from '../constants/departments';

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
  const filteredSteps =
    steps?.filter(
      (step) =>
        step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stripHtmlTags(step.description || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  // Paginate the filtered steps
  const paginatedSteps = filteredSteps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const actions = (
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={() => setShowCreateForm(true)}
      sx={{
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        px: 2,
        py: 0.75,
      }}
    >
      Nouvelle Étape
    </Button>
  );

  return (
    <PageLayout
      title="Gestion des Étapes"
      loading={isLoading}
      error={error ? 'Échec du chargement des étapes' : null}
      actions={actions}
    >
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
            ),
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
              <TableCell sx={{ fontWeight: 'bold' }}>Pôles associés</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de début</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de fin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSteps.length > 0 ? (
              paginatedSteps.map((step) => (
                <TableRow
                  key={step.id}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
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
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {step.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {step.description ? (
                      <Tooltip
                        title={<RichTextViewer content={step.description} />}
                        placement="top"
                        arrow
                        enterDelay={300}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'help',
                          }}
                        >
                          {stripHtmlTags(step.description)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {step.associatedDepartments && step.associatedDepartments.length > 0 ? (
                        step.associatedDepartments.map((dept) => (
                          <Chip
                            key={dept}
                            label={getDepartmentLabel(dept)}
                            size="small"
                            sx={{
                              backgroundColor: getDepartmentColor(dept),
                              color: '#FFFFFF',
                              fontWeight: 500,
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(step.startDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{new Date(step.endDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Voir">
                        <IconButton size="small" onClick={() => handleView(step.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleEdit(step)}>
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
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
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
    </PageLayout>
  );
};

export default StepsPageTable;
