import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project } from '../types/entities';

export class TimelineExportService {
  /**
   * Export timeline as PNG image
   */
  static async exportAsPNG(element: HTMLElement, filename: string = 'timeline.png'): Promise<void> {
    try {
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export PNG:', error);
      throw error;
    }
  }

  /**
   * Export timeline as SVG image
   */
  static async exportAsSVG(element: HTMLElement, filename: string = 'timeline.svg'): Promise<void> {
    try {
      const dataUrl = await toSvg(element, {
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export SVG:', error);
      throw error;
    }
  }

  /**
   * Export timeline as PDF
   */
  static async exportAsPDF(element: HTMLElement, filename: string = 'timeline.pdf'): Promise<void> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3',
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }

  /**
   * Export projects data as Excel file
   */
  static exportAsExcel(projects: Project[], filename: string = 'timeline.xlsx'): void {
    const wb = XLSX.utils.book_new();
    
    // Trier les projets par date de début
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    // Calculer les dates min et max
    const allDates = sortedProjects.flatMap(p => [new Date(p.startDate), new Date(p.endDate)]);
    const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
    const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();
    
    // Feuille 1 : Données détaillées
    const detailsData = sortedProjects.map((project) => {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const status = this.getProjectStatus(project);
      const progress = this.calculateProgress(project);
      
      return {
        'Nom du projet': project.title,
        'Description': project.description || '',
        'Date de début': format(start, 'dd/MM/yyyy', { locale: fr }),
        'Date de fin': format(end, 'dd/MM/yyyy', { locale: fr }),
        'Durée (jours)': duration,
        'Statut': status,
        'Progression (%)': progress,
      };
    });
    
    const wsDetails = XLSX.utils.json_to_sheet(detailsData);
    wsDetails['!cols'] = [
      { wch: 30 }, // Nom
      { wch: 50 }, // Description
      { wch: 15 }, // Date début
      { wch: 15 }, // Date fin
      { wch: 15 }, // Durée
      { wch: 15 }, // Statut
      { wch: 15 }, // Progression
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Projets');
    
    // Feuille 2 : Tableau de bord
    const dashboardData = [
      { 'Métrique': 'TABLEAU DE BORD PROJETS', 'Valeur': '', 'Détail': '' },
      { 'Métrique': '', 'Valeur': '', 'Détail': '' },
      { 'Métrique': '═══ Vue d\'ensemble ═══', 'Valeur': '', 'Détail': '' },
      { 'Métrique': 'Nombre total de projets', 'Valeur': projects.length, 'Détail': '' },
      { 'Métrique': 'Projets en cours', 'Valeur': projects.filter(p => this.getProjectStatus(p) === 'En cours').length, 'Détail': projects.length > 0 ? `${Math.round(projects.filter(p => this.getProjectStatus(p) === 'En cours').length / projects.length * 100)}%` : '0%' },
      { 'Métrique': 'Projets terminés', 'Valeur': projects.filter(p => this.getProjectStatus(p) === 'Terminé').length, 'Détail': projects.length > 0 ? `${Math.round(projects.filter(p => this.getProjectStatus(p) === 'Terminé').length / projects.length * 100)}%` : '0%' },
      { 'Métrique': 'Projets à venir', 'Valeur': projects.filter(p => this.getProjectStatus(p) === 'À venir').length, 'Détail': projects.length > 0 ? `${Math.round(projects.filter(p => this.getProjectStatus(p) === 'À venir').length / projects.length * 100)}%` : '0%' },
      { 'Métrique': '', 'Valeur': '', 'Détail': '' },
      { 'Métrique': '═══ Métriques temporelles ═══', 'Valeur': '', 'Détail': '' },
      { 'Métrique': 'Durée moyenne (jours)', 'Valeur': projects.length > 0 ? Math.round(projects.reduce((sum, p) => {
        const duration = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + duration;
      }, 0) / projects.length) : 0, 'Détail': '' },
      { 'Métrique': 'Durée totale cumulée (jours)', 'Valeur': projects.reduce((sum, p) => {
        const duration = Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + duration;
      }, 0), 'Détail': '' },
      { 'Métrique': 'Progression moyenne (%)', 'Valeur': projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + this.calculateProgress(p), 0) / projects.length) : 0, 'Détail': '' },
      { 'Métrique': '', 'Valeur': '', 'Détail': '' },
      { 'Métrique': '═══ Période couverte ═══', 'Valeur': '', 'Détail': '' },
      { 'Métrique': 'Date de début la plus ancienne', 'Valeur': format(minDate, 'dd/MM/yyyy', { locale: fr }), 'Détail': '' },
      { 'Métrique': 'Date de fin la plus tardive', 'Valeur': format(maxDate, 'dd/MM/yyyy', { locale: fr }), 'Détail': '' },
      { 'Métrique': 'Période totale (jours)', 'Valeur': Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, 'Détail': '' },
      { 'Métrique': '', 'Valeur': '', 'Détail': '' },
      { 'Métrique': '═══ Analyse ═══', 'Valeur': '', 'Détail': '' },
      { 'Métrique': 'Projets en retard (< 50% progression)', 'Valeur': projects.filter(p => {
        const status = this.getProjectStatus(p);
        const progress = this.calculateProgress(p);
        return status === 'En cours' && progress < 50;
      }).length, 'Détail': '' },
      { 'Métrique': 'Projets presque terminés (> 80%)', 'Valeur': projects.filter(p => {
        const status = this.getProjectStatus(p);
        const progress = this.calculateProgress(p);
        return status === 'En cours' && progress > 80;
      }).length, 'Détail': '' },
      { 'Métrique': 'Projets démarrant dans 7 jours', 'Valeur': projects.filter(p => {
        const start = new Date(p.startDate);
        const now = new Date();
        const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilStart > 0 && daysUntilStart <= 7;
      }).length, 'Détail': '' },
    ];
    
    const wsDashboard = XLSX.utils.json_to_sheet(dashboardData);
    wsDashboard['!cols'] = [
      { wch: 35 }, // Métrique
      { wch: 20 }, // Valeur
      { wch: 15 }, // Détail
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDashboard, 'Tableau de bord');
    
    // Feuille 3 : Planning mensuel
    const monthlyData: any[] = [];
    
    // Générer un planning pour chaque mois couvert
    const monthsToShow = new Set<string>();
    sortedProjects.forEach(project => {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        monthsToShow.add(format(current, 'yyyy-MM'));
        current.setMonth(current.getMonth() + 1);
      }
    });
    
    Array.from(monthsToShow).sort().forEach(monthStr => {
      const [year, month] = monthStr.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      // Lister les projets actifs ce mois
      const activeProjects = sortedProjects.filter(project => {
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        return start <= monthEnd && end >= monthDate;
      });
      
      if (activeProjects.length > 0) {
        monthlyData.push({ 
          'Mois': format(monthDate, 'MMMM yyyy', { locale: fr }).toUpperCase(),
          'Projet': '',
          'Période': '',
          'Statut': '',
          'Progression': ''
        });
        
        activeProjects.forEach(project => {
          const start = new Date(project.startDate);
          const end = new Date(project.endDate);
          const status = this.getProjectStatus(project);
          
          let dateRange = '';
          if (start >= monthDate && start.getMonth() === month - 1) {
            dateRange += format(start, 'dd', { locale: fr });
          } else {
            dateRange += '01';
          }
          dateRange += ' - ';
          if (end.getMonth() === month - 1 && end.getFullYear() === year) {
            dateRange += format(end, 'dd', { locale: fr });
          } else {
            dateRange += format(monthEnd, 'dd', { locale: fr });
          }
          
          monthlyData.push({
            'Mois': '',
            'Projet': project.title,
            'Période': dateRange,
            'Statut': status,
            'Progression': `${this.calculateProgress(project)}%`
          });
        });
        
        monthlyData.push({ 'Mois': '', 'Projet': '', 'Période': '', 'Statut': '', 'Progression': '' }); // Ligne vide
      }
    });
    
    if (monthlyData.length > 0) {
      const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
      wsMonthly['!cols'] = [
        { wch: 20 }, // Mois
        { wch: 40 }, // Projet
        { wch: 15 }, // Période
        { wch: 15 }, // Statut
        { wch: 15 }, // Progression
      ];
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Planning mensuel');
    }
    
    XLSX.writeFile(wb, filename);
  }
  
  // Méthode helper pour convertir une date en valeur numérique Excel
  private static excelDateValue(date: Date): number {
    // Excel compte les jours depuis le 1er janvier 1900 (avec un bug du 29 février 1900)
    const excelEpoch = new Date(1899, 11, 30); // 30 décembre 1899
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((date.getTime() - excelEpoch.getTime()) / msPerDay);
  }
  
  // Méthode helper pour obtenir la lettre de colonne Excel
  private static getExcelColumnLetter(col: number): string {
    let letter = '';
    while (col > 0) {
      const remainder = (col - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      col = Math.floor((col - 1) / 26);
    }
    return letter;
  }

  /**
   * Export projects data as CSV file
   */
  static exportAsCSV(projects: Project[], filename: string = 'timeline.csv'): void {
    const data = projects.map(project => ({
      'Nom du projet': project.title,
      'Description': project.description || '',
      'Date de début': format(new Date(project.startDate), 'yyyy-MM-dd'),
      'Date de fin': format(new Date(project.endDate), 'yyyy-MM-dd'),
      'Durée (jours)': Math.ceil(
        (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ),
      'Statut': this.getProjectStatus(project),
      'Progression (%)': this.calculateProgress(project),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  }

  /**
   * Export as MS Project XML format
   */
  static exportAsMSProjectXML(projects: Project[], filename: string = 'timeline.xml'): void {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Timeline Export</Name>
  <Title>Projets exportés depuis FtelMap</Title>
  <CreationDate>${new Date().toISOString()}</CreationDate>
  <Tasks>
    ${projects.map((project, index) => `
    <Task>
      <UID>${index + 1}</UID>
      <ID>${index + 1}</ID>
      <Name>${this.escapeXml(project.title)}</Name>
      <Notes>${this.escapeXml(project.description || '')}</Notes>
      <Start>${new Date(project.startDate).toISOString()}</Start>
      <Finish>${new Date(project.endDate).toISOString()}</Finish>
      <Duration>PT${Math.ceil(
        (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) * 8}H0M0S</Duration>
      <PercentComplete>${this.calculateProgress(project)}</PercentComplete>
      <Priority>500</Priority>
    </Task>`).join('')}
  </Tasks>
</Project>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    saveAs(blob, filename);
  }

  /**
   * Export projects as JSON
   */
  static exportAsJSON(projects: Project[], filename: string = 'timeline.json'): void {
    const data = {
      exportDate: new Date().toISOString(),
      projectCount: projects.length,
      projects: projects.map(project => ({
        ...project,
        duration: Math.ceil(
          (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
        status: this.getProjectStatus(project),
        progress: this.calculateProgress(project),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json;charset=utf-8' 
    });
    saveAs(blob, filename);
  }

  /**
   * Export as interactive HTML Gantt chart
   */
  static exportAsHTMLGantt(projects: Project[], filename: string = 'timeline.html'): void {
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timeline des Projets - ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            color: #1e293b;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }
        .timeline {
            position: relative;
            padding: 20px 0;
            overflow-x: auto;
        }
        .project {
            position: relative;
            margin: 15px 0;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .project:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .project-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .project-dates {
            font-size: 14px;
            opacity: 0.9;
        }
        .project-duration {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 5px;
        }
        .legend {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat {
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
        }
        .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Timeline des Projets</h1>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-label">Total des projets</div>
                <div class="stat-value">${projects.length}</div>
            </div>
            <div class="stat">
                <div class="stat-label">En cours</div>
                <div class="stat-value">${projects.filter(p => this.getProjectStatus(p) === 'En cours').length}</div>
            </div>
            <div class="stat">
                <div class="stat-label">À venir</div>
                <div class="stat-value">${projects.filter(p => this.getProjectStatus(p) === 'À venir').length}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Terminés</div>
                <div class="stat-value">${projects.filter(p => this.getProjectStatus(p) === 'Terminé').length}</div>
            </div>
        </div>
        
        <div class="timeline">
            ${sortedProjects.map(project => {
              const duration = Math.ceil(
                (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              return `
            <div class="project" style="background: ${project.backgroundColor}; color: ${project.textColor}">
                <div class="project-title">${this.escapeHtml(project.title)}</div>
                <div class="project-dates">
                    ${format(new Date(project.startDate), 'dd MMM yyyy', { locale: fr })} → 
                    ${format(new Date(project.endDate), 'dd MMM yyyy', { locale: fr })}
                </div>
                <div class="project-duration">${duration} jour${duration > 1 ? 's' : ''}</div>
            </div>`;
            }).join('')}
        </div>
        
        <div class="legend">
            <p>📅 Exporté le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
            <p>🏢 FtelMap - Gestion de projets</p>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, filename);
  }

  /**
   * Export as Markdown
   */
  static exportAsMarkdown(projects: Project[], filename: string = 'timeline.md'): void {
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const markdown = `# Timeline des Projets
*Exporté le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}*

## 📊 Statistiques
- **Total des projets :** ${projects.length}
- **En cours :** ${projects.filter(p => this.getProjectStatus(p) === 'En cours').length}
- **À venir :** ${projects.filter(p => this.getProjectStatus(p) === 'À venir').length}
- **Terminés :** ${projects.filter(p => this.getProjectStatus(p) === 'Terminé').length}

## 📅 Liste des Projets

${sortedProjects.map(project => {
  const duration = Math.ceil(
    (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  const status = this.getProjectStatus(project);
  const progress = this.calculateProgress(project);
  
  return `### ${project.title}
- **Statut :** ${status}
- **Dates :** ${format(new Date(project.startDate), 'dd/MM/yyyy')} → ${format(new Date(project.endDate), 'dd/MM/yyyy')}
- **Durée :** ${duration} jour${duration > 1 ? 's' : ''}
- **Progression :** ${progress}%
${project.description ? `- **Description :** ${project.description}` : ''}
`;
}).join('\n---\n\n')}

---
*Généré par FtelMap - Gestion de projets*`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
  }

  // Méthodes utilitaires
  private static getProjectStatus(project: Project): string {
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    if (now < start) return 'À venir';
    if (now > end) return 'Terminé';
    return 'En cours';
  }

  private static calculateProgress(project: Project): number {
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}