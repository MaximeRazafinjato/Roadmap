import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSteps, useDeleteStep } from '../hooks/use-steps';
import StepForm from '../components/StepForm';
import type { Step } from '../types/entities';

const StepsPage = () => {
  const navigate = useNavigate();
  const { data: steps, isLoading, error } = useSteps();
  const deleteStep = useDeleteStep();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      await deleteStep.mutateAsync(id);
    }
  };

  const handleView = (id: string) => {
    navigate(`/steps/${id}`);
  };

  if (isLoading) return <div className="loading">Chargement des étapes...</div>;
  if (error) return <div className="error">Échec du chargement des étapes</div>;

  return (
    <div className="steps-page">
      <div className="page-header">
        <h2>Étapes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Créer une Nouvelle Étape
        </button>
      </div>

      {showCreateForm && (
        <StepForm
          step={selectedStep}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedStep(null);
          }}
        />
      )}

      {steps && steps.length > 0 ? (
        <div className="steps-grid">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="step-card"
              onClick={() => handleView(step.id)}
              style={{
                borderLeft: `4px solid ${step.backgroundColor}`,
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
              <div className="step-card-header">
                <h3>{step.title}</h3>
              </div>
              <p className="step-description">{step.description}</p>
              <div className="step-meta">
                <div>
                  <strong>Date de Début :</strong> {new Date(step.startDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Date de Fin :</strong> {new Date(step.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Durée :</strong> {Math.ceil((new Date(step.endDate).getTime() - new Date(step.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              </div>
              <div className="step-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    setSelectedStep(step);
                    setShowCreateForm(true);
                  }}
                  title="Modifier l'étape"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Modifier</span>
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(step.id)}
                  disabled={deleteStep.isPending}
                  title="Supprimer l'étape"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Aucune étape trouvée. Créez votre première étape pour commencer !</p>
        </div>
      )}
    </div>
  );
};

export default StepsPage;