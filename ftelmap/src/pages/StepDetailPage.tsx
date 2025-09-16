import { useParams, useNavigate } from 'react-router-dom';
import { useStep } from '../hooks/use-steps';

const StepDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: step, isLoading, error } = useStep(id);

  if (isLoading) return <div className="loading">Chargement des détails de l'étape...</div>;
  if (error) return <div className="error">Échec du chargement des détails de l'étape</div>;
  if (!step) return <div className="error">Étape introuvable</div>;

  return (
    <div className="step-detail-page">
      <div className="page-header">
        <button 
          className="btn btn-link"
          onClick={() => navigate('/steps')}
        >
          ← Retour aux Étapes
        </button>
      </div>

      <div className="step-detail">
        <div className="detail-header">
          <h1>{step.title}</h1>
          <div 
            style={{
              backgroundColor: step.backgroundColor,
              color: step.textColor,
              padding: '4px 12px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Étape
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{step.description}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Date de Début</label>
            <p>{new Date(step.startDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Date de Fin</label>
            <p>{new Date(step.endDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Durée</label>
            <p>{Math.ceil((new Date(step.endDate).getTime() - new Date(step.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours</p>
          </div>
          <div className="detail-item">
            <label>Couleurs</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: step.backgroundColor,
                border: '1px solid #ccc',
                borderRadius: '4px'
              }} />
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: step.textColor,
                border: '1px solid #ccc',
                borderRadius: '4px'
              }} />
            </div>
          </div>
          <div className="detail-item">
            <label>Créé</label>
            <p>{new Date(step.createdAt).toLocaleString()}</p>
          </div>
          <div className="detail-item">
            <label>Dernière mise à jour</label>
            <p>{new Date(step.updatedAt).toLocaleString()}</p>
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
              backgroundColor: step.backgroundColor,
              color: step.textColor,
              padding: '8px 16px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>{step.title}</strong>
              <br />
              <small>{new Date(step.startDate).toLocaleDateString()} - {new Date(step.endDate).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDetailPage;