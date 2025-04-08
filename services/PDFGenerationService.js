import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Colors from '../constants/colors';

class PDFGenerationService {
  generateHTML(data) {
    const {
      moduleScores,
      avgScore,
      assessment
    } = data;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid ${Colors.primary};
              padding-bottom: 20px;
            }
            .score-card {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .score-item {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .assessment {
              border-left: 4px solid ${assessment.color};
              padding: 15px;
              background: #f9f9f9;
              margin: 20px 0;
            }
            .section-title {
              color: ${Colors.primary};
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            .chart-container {
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PhishGuard Assessment Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section-title">Overall Assessment</div>
          <div class="assessment">
            <h3 style="color: ${assessment.color}">Score: ${Math.round(avgScore)}%</h3>
            <p>${assessment.text}</p>
          </div>

          <div class="section-title">Detailed Scores</div>
          <div class="score-card">
            ${Object.entries(moduleScores)
              .map(([category, score]) => `
                <div class="score-item">
                  <strong>${category}</strong>
                  <span style="color: ${this.getScoreColor(score)}">${Math.round(score)}%</span>
                </div>
              `).join('')}
          </div>

          <div class="section-title">Analysis Breakdown</div>
          <div class="score-card">
            <p><strong>Rapport Building (${Math.round(moduleScores['Rapport Building'])}%):</strong> Measures your ability to identify and maintain secure communication practices.</p>
            <p><strong>Personality (${Math.round(moduleScores['Personality'])}%):</strong> Evaluates your natural tendencies in handling security-related situations.</p>
            <p><strong>Cognitive Pattern (${Math.round(moduleScores['Cognitive Pattern'])}%):</strong> Assesses your analytical approach to potential security threats.</p>
            <p><strong>Risk Assessment (${Math.round(moduleScores['Risk Assessment'])}%):</strong> Examines your risk awareness and decision-making in security contexts.</p>
          </div>

          <div class="section-title">Recommendations</div>
          <div class="score-card">
            ${this.generateRecommendations(moduleScores)}
          </div>
        </body>
      </html>
    `;
  }

  getScoreColor(score) {
    if (score >= 80) return '#2E7D32';
    if (score >= 64) return '#4CAF50';
    if (score >= 32) return '#FFA500';
    return '#FF4B4B';
  }

  generateRecommendations(scores) {
    let recommendations = [];

    if (scores['Rapport Building'] < 64) {
      recommendations.push('Focus on developing stronger security communication practices and awareness of social engineering tactics.');
    }
    if (scores['Personality'] < 64) {
      recommendations.push('Work on building more security-conscious habits and responses to potential threats.');
    }
    if (scores['Cognitive Pattern'] < 64) {
      recommendations.push('Enhance your analytical skills in identifying and evaluating security risks.');
    }
    if (scores['Risk Assessment'] < 64) {
      recommendations.push('Improve your understanding of security risks and develop more cautious decision-making processes.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain your excellent security awareness and continue staying updated on latest security practices.');
    }

    return recommendations.map(rec => `<p>• ${rec}</p>`).join('');
  }

  async generatePDF(data) {
    try {
      const html = this.generateHTML(data);
      
      // Generate PDF using expo-print
      const file = await Print.printToFileAsync({
        html,
        base64: false
      });

      // Move file to documents directory for sharing
      const filename = 'PhishGuard_Assessment_Report.pdf';
      const documentPath = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.moveAsync({
        from: file.uri,
        to: documentPath
      });

      return documentPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async sharePDF(filePath) {
    try {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Your Assessment Report'
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw error;
    }
  }
}

export default new PDFGenerationService();