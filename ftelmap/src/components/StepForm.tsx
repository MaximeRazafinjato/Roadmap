import { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Chip, Box, OutlinedInput } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useCreateStep, useUpdateStep } from '../hooks/use-steps';
import { type Step, type CreateStepForm, type UpdateStepForm, Department } from '../types/entities';
import { RichTextEditor } from './RichTextEditor';
import { DEPARTMENT_OPTIONS, getDepartmentColor } from '../constants/departments';

interface StepFormProps {
  step?: Step | null;
  onClose: () => void;
  ownerId?: string;
}

const StepForm: React.FC<StepFormProps> = ({ step, onClose, ownerId }) => {
  const createStep = useCreateStep();
  const updateStep = useUpdateStep();
  const isEditing = !!step?.id; // Only consider it editing if step has an ID

  const [formData, setFormData] = useState<CreateStepForm>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    associatedDepartments: [],
    ownerId: ownerId || '00000000-0000-0000-0000-000000000001', // Use provided ownerId or default
  });

  // Preset color combinations
  const colorPresets = [
    { bg: '#3B82F6', text: '#FFFFFF', name: 'Bleu' },
    { bg: '#10B981', text: '#FFFFFF', name: 'Vert' },
    { bg: '#8B5CF6', text: '#FFFFFF', name: 'Violet' },
    { bg: '#EF4444', text: '#FFFFFF', name: 'Rouge' },
    { bg: '#F59E0B', text: '#FFFFFF', name: 'Orange' },
    { bg: '#EC4899', text: '#FFFFFF', name: 'Rose' },
    { bg: '#14B8A6', text: '#FFFFFF', name: 'Turquoise' },
    { bg: '#6B7280', text: '#FFFFFF', name: 'Gris' },
  ];

  useEffect(() => {
    if (step) {
      setFormData({
        title: step.title || '',
        description: step.description || '',
        startDate: step.startDate
          ? step.startDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        endDate: step.endDate
          ? step.endDate.split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        backgroundColor: step.backgroundColor || '#3B82F6',
        textColor: step.textColor || '#FFFFFF',
        associatedDepartments: step.associatedDepartments || [],
        ownerId: step.ownerId || ownerId || '00000000-0000-0000-0000-000000000001',
      });
    } else if (ownerId) {
      setFormData((prev) => ({
        ...prev,
        ownerId: ownerId,
      }));
    }
  }, [step, ownerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && step?.id) {
        const updateData: UpdateStepForm = {
          ...formData,
          id: step.id,
        };
        await updateStep.mutateAsync(updateData);
      } else {
        await createStep.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save step:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorPresetClick = (bg: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      backgroundColor: bg,
      textColor: text,
    }));
  };

  const handleDepartmentsChange = (event: SelectChangeEvent<Department[]>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      associatedDepartments: typeof value === 'string' ? [] : value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEditing ? "Modifier l'Étape" : 'Créer une Nouvelle Étape'}</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              form="step-form"
              className="btn btn-primary"
              disabled={createStep.isPending || updateStep.isPending}
            >
              {createStep.isPending || updateStep.isPending
                ? 'Enregistrement...'
                : isEditing
                  ? "Mettre à jour l'Étape"
                  : "Créer l'Étape"}
            </button>
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="step-form" id="step-form">
          <div className="form-group">
            <label htmlFor="title">Titre de l'Étape *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Entrez le titre de l'étape"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
              placeholder="Entrez la description de l'étape"
            />
          </div>

          <div className="form-group">
            <FormControl fullWidth size="small">
              <InputLabel id="departments-label">Pôles associés</InputLabel>
              <Select
                labelId="departments-label"
                id="departments"
                multiple
                value={formData.associatedDepartments}
                onChange={handleDepartmentsChange}
                input={<OutlinedInput label="Pôles associés" />}
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const option = DEPARTMENT_OPTIONS.find((opt) => opt.value === value);
                      return (
                        <Chip
                          key={value}
                          label={option?.label || value}
                          size="small"
                          sx={{
                            backgroundColor: getDepartmentColor(value),
                            color: '#FFFFFF',
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Date de Début *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Date de Fin *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Couleurs *</label>
            <div className="color-presets">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className={`color-preset ${formData.backgroundColor === preset.bg ? 'selected' : ''}`}
                  style={{ backgroundColor: preset.bg, color: preset.text }}
                  onClick={() => handleColorPresetClick(preset.bg, preset.text)}
                  title={preset.name}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="color-inputs">
              <input
                type="color"
                id="backgroundColor"
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleChange}
                title="Couleur de fond"
              />
              <input
                type="color"
                id="textColor"
                name="textColor"
                value={formData.textColor}
                onChange={handleChange}
                title="Couleur du texte"
              />
              <div
                className="color-preview"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                  padding: '5px 10px',
                  borderRadius: '4px',
                  marginLeft: '10px',
                }}
              >
                Aperçu
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepForm;
