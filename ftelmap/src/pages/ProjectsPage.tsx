import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '../hooks/use-projects';
import ProjectForm from '../components/ProjectForm';
import type { Project } from '../types/entities';
import { getStatusLabel } from '../utils/status-helpers';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject.mutateAsync(id);
    }
  };

  const handleView = (id: string) => {
    navigate(`/projects/${id}`);
  };

  if (isLoading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">Failed to load projects</div>;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Project
        </button>
      </div>

      {showCreateForm && (
        <ProjectForm
          project={selectedProject}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedProject(null);
          }}
        />
      )}

      {projects && projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${getStatusLabel(project.status).toLowerCase()}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <div>
                  <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
                </div>
                {project.endDate && (
                  <div>
                    <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <strong>Budget:</strong> ${project.budget.toLocaleString()}
                </div>
              </div>
              <div className="project-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleView(project.id)}
                >
                  View
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowCreateForm(true);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(project.id)}
                  disabled={deleteProject.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No projects found. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;