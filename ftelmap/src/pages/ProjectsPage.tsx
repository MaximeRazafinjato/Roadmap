import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '../hooks/use-projects';
import ProjectForm from '../components/ProjectForm';
import type { Project } from '../types/entities';
import { TimelinePosition } from '../types/entities';

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
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => handleView(project.id)}
              style={{
                borderLeft: `4px solid ${project.backgroundColor}`,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <div 
                  className="project-color-badge"
                  style={{
                    backgroundColor: project.backgroundColor,
                    color: project.textColor,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {project.position === TimelinePosition.Top ? 'Top' : 'Bottom'}
                </div>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <div>
                  <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Duration:</strong> {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowCreateForm(true);
                  }}
                  title="Edit project"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Edit</span>
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(project.id)}
                  disabled={deleteProject.isPending}
                  title="Delete project"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>Delete</span>
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