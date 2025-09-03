import { useProjects } from '../hooks/use-projects';
import { ProjectStatus } from '../types/entities';

const DashboardPage = () => {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Failed to load dashboard</div>;

  const projectsByStatus = projects?.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStatus, number>) || {};

  const totalBudget = projects?.reduce((sum, project) => sum + project.budget, 0) || 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your project management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-value">{projects?.length || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Budget</h3>
          <p className="stat-value">
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-value">{projectsByStatus[ProjectStatus.InProgress] || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-value">{projectsByStatus[ProjectStatus.Completed] || 0}</p>
        </div>
      </div>

      <div className="recent-projects">
        <h3>Recent Projects</h3>
        {projects && projects.length > 0 ? (
          <div className="project-list">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="project-card-mini">
                <h4>{project.name}</h4>
                <span className={`status-badge ${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects yet. Create your first project!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;