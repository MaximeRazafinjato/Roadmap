import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/use-projects';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) return <div className="loading">Loading project details...</div>;
  if (error) return <div className="error">Failed to load project details</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="project-detail-page">
      <div className="page-header">
        <button 
          className="btn btn-link"
          onClick={() => navigate('/projects')}
        >
          ← Back to Projects
        </button>
      </div>

      <div className="project-detail">
        <div className="detail-header">
          <h1>{project.name}</h1>
          <span className={`status-badge ${project.status.toLowerCase()}`}>
            {project.status}
          </span>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Start Date</label>
            <p>{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          {project.endDate && (
            <div className="detail-item">
              <label>End Date</label>
              <p>{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          )}
          <div className="detail-item">
            <label>Budget</label>
            <p>${project.budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="detail-item">
            <label>Created</label>
            <p>{new Date(project.createdAt).toLocaleString()}</p>
          </div>
          <div className="detail-item">
            <label>Last Updated</label>
            <p>{new Date(project.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="detail-section">
          <h3>Tasks</h3>
          {project.tasks && project.tasks.length > 0 ? (
            <div className="task-list">
              {project.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <h4>{task.title}</h4>
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className={`status-badge ${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks yet</p>
          )}
        </div>

        <div className="detail-section">
          <h3>Milestones</h3>
          {project.milestones && project.milestones.length > 0 ? (
            <div className="milestone-list">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="milestone-item">
                  <h4>{milestone.name}</h4>
                  <p>{milestone.description}</p>
                  <p>Target: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                  {milestone.isCompleted && (
                    <span className="completed-badge">Completed</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No milestones yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;