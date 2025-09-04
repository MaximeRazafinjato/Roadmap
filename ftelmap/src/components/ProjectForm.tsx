import { useState, useEffect } from 'react';
import { useCreateProject, useUpdateProject } from '../hooks/use-projects';
import { type Project, TimelinePosition, type CreateProjectForm, type UpdateProjectForm } from '../types/entities';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = !!project;

  const [formData, setFormData] = useState<CreateProjectForm>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    position: TimelinePosition.Top,
    ownerId: '00000000-0000-0000-0000-000000000001', // Temporary default user ID
  });

  // Preset color combinations
  const colorPresets = [
    { bg: '#3B82F6', text: '#FFFFFF', name: 'Blue' },
    { bg: '#10B981', text: '#FFFFFF', name: 'Green' },
    { bg: '#8B5CF6', text: '#FFFFFF', name: 'Purple' },
    { bg: '#EF4444', text: '#FFFFFF', name: 'Red' },
    { bg: '#F59E0B', text: '#FFFFFF', name: 'Orange' },
    { bg: '#EC4899', text: '#FFFFFF', name: 'Pink' },
    { bg: '#14B8A6', text: '#FFFFFF', name: 'Teal' },
    { bg: '#6B7280', text: '#FFFFFF', name: 'Gray' },
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        backgroundColor: project.backgroundColor,
        textColor: project.textColor,
        position: project.position,
        ownerId: project.ownerId,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && project) {
        const updateData: UpdateProjectForm = {
          ...formData,
          id: project.id,
        };
        await updateProject.mutateAsync(updateData);
      } else {
        await createProject.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'position' ? parseInt(value, 10) : value,
    }));
  };

  const handleColorPresetClick = (bg: string, text: string) => {
    setFormData((prev) => ({
      ...prev,
      backgroundColor: bg,
      textColor: text,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              type="submit"
              form="project-form"
              className="btn btn-primary"
              disabled={createProject.isPending || updateProject.isPending}
            >
              {createProject.isPending || updateProject.isPending
                ? 'Saving...'
                : isEditing
                ? 'Update Project'
                : 'Create Project'}
            </button>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="project-form" id="project-form">
          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter project title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
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
              <label htmlFor="endDate">End Date *</label>
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
            <label>Colors *</label>
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
                title="Background color"
              />
              <input
                type="color"
                id="textColor"
                name="textColor"
                value={formData.textColor}
                onChange={handleChange}
                title="Text color"
              />
              <div 
                className="color-preview" 
                style={{ 
                  backgroundColor: formData.backgroundColor, 
                  color: formData.textColor,
                  padding: '5px 10px',
                  borderRadius: '4px',
                  marginLeft: '10px'
                }}
              >
                Preview
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="position">Timeline Position *</label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value={TimelinePosition.Top}>Top</option>
              <option value={TimelinePosition.Bottom}>Bottom</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;