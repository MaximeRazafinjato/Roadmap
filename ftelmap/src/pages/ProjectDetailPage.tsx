import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/use-projects';
import { TimelinePosition } from '../types/entities';

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
          <h1>{project.title}</h1>
          <div 
            style={{
              backgroundColor: project.backgroundColor,
              color: project.textColor,
              padding: '4px 12px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {project.position === TimelinePosition.Top ? 'Top' : 'Bottom'} Position
          </div>
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
          <div className="detail-item">
            <label>End Date</label>
            <p>{new Date(project.endDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Duration</label>
            <p>{Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
          </div>
          <div className="detail-item">
            <label>Colors</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: project.backgroundColor,
                border: '1px solid #ccc',
                borderRadius: '4px'
              }} />
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: project.textColor,
                border: '1px solid #ccc',
                borderRadius: '4px'
              }} />
            </div>
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
          <h3>Timeline Preview</h3>
          <div style={{
            position: 'relative',
            height: '100px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <div style={{
              position: 'absolute',
              left: '0',
              right: '0',
              top: '50%',
              height: '2px',
              backgroundColor: '#ddd',
              transform: 'translateY(-50%)'
            }} />
            <div style={{
              position: 'absolute',
              left: '20px',
              right: '20px',
              top: project.position === 0 ? '10px' : 'auto',
              bottom: project.position === 1 ? '10px' : 'auto',
              backgroundColor: project.backgroundColor,
              color: project.textColor,
              padding: '8px 16px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>{project.title}</strong>
              <br />
              <small>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;