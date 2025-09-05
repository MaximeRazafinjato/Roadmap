import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/use-projects';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) return <div className="loading">Chargement des détails du projet...</div>;
  if (error) return <div className="error">Échec du chargement des détails du projet</div>;
  if (!project) return <div className="error">Projet introuvable</div>;

  return (
    <div className="project-detail-page">
      <div className="page-header">
        <button 
          className="btn btn-link"
          onClick={() => navigate('/projects')}
        >
          ← Retour aux Projets
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
            Projet
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Date de Début</label>
            <p>{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Date de Fin</label>
            <p>{new Date(project.endDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Durée</label>
            <p>{Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours</p>
          </div>
          <div className="detail-item">
            <label>Couleurs</label>
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
            <label>Créé</label>
            <p>{new Date(project.createdAt).toLocaleString()}</p>
          </div>
          <div className="detail-item">
            <label>Dernière mise à jour</label>
            <p>{new Date(project.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="detail-section">
          <h3>Aperçu de la Timeline</h3>
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
              top: '25px',
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