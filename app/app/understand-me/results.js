import { View, Text, Dimensions, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import { useEffect, useState } from "react";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield, Star, AlertTriangle, CheckCircle, Download, Home } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import PDFGenerationService from "../../../services/PDFGenerationService";

export default function Results() {
  const navigation = useNavigation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const {
    moduleOneAnswers,
    moduleTwoAnswers,
    moduleThreeAnswers,
    moduleFourAnswers,
    setCurrentModule
  } = useUnderstandMeContext();

  useEffect(() => {
    // Explicitly disable screenshot prevention for results page
    setCurrentModule(null);
  }, [setCurrentModule]);

  const convertToPercentage = (score) => (score - 1) * 20;

  const calculateModuleScore = (answers, isRiskModule = false) => {
    if (!answers || Object.keys(answers).length === 0) return 0;
    
    const pointValues = isRiskModule ? 
      { "Never": 5, "Rarely": 4, "Sometimes": 3, "Often": 2, "Always": 1 } :
      { "Never": 1, "Rarely": 2, "Sometimes": 3, "Often": 4, "Always": 5 };

    const scores = Object.values(answers).map(answer => pointValues[answer] || 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return convertToPercentage(averageScore);
  };

  const moduleScores = {
    "Report": calculateModuleScore(moduleOneAnswers),
    "Behavior": calculateModuleScore(moduleTwoAnswers),
    "Cognition": calculateModuleScore(moduleThreeAnswers),
    "Risk": calculateModuleScore(moduleFourAnswers, true)
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#2E7D32';
    if (score >= 64) return '#4CAF50';
    if (score >= 32) return '#FFA500';
    return '#FF4B4B';
  };

  const scoreEntries = Object.entries(moduleScores).map(([category, score]) => ({
    category,
    score,
    color: getScoreColor(score)
  }));

  const data = {
    labels: scoreEntries.map(entry => entry.category),
    datasets: [{
      data: scoreEntries.map(entry => entry.score)
    }]
  };

  const avgScore = Object.values(moduleScores).reduce((sum, score) => sum + score, 0) / Object.keys(moduleScores).length;

  const getOverallAssessment = (score) => {
    if (score >= 80) return {
      icon: <Star size={24} color="#2E7D32" />,
      text: "Excellent security awareness! You demonstrate exceptional understanding of cybersecurity best practices and risk management.",
      color: "#2E7D32"
    };
    if (score >= 64) return {
      icon: <CheckCircle size={24} color="#4CAF50" />,
      text: "Good security awareness! You show solid understanding, with some room for improvement in specific areas.",
      color: "#4CAF50"
    };
    if (score >= 32) return {
      icon: <AlertTriangle size={24} color="#FFA500" />,
      text: "Moderate security awareness. Consider strengthening your security practices in areas with lower scores.",
      color: "#FFA500"
    };
    return {
      icon: <AlertTriangle size={24} color="#FF4B4B" />,
      text: "Your security awareness needs immediate attention. Focus on developing safer online behaviors and review basic security practices.",
      color: "#FF4B4B"
    };
  };

  const assessment = getOverallAssessment(avgScore);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingPDF(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const reportData = {
        moduleScores,
        avgScore,
        assessment
      };

      const filePath = await PDFGenerationService.generatePDF(reportData);
      await PDFGenerationService.sharePDF(filePath);
    } catch (error) {
      console.error('Error generating report:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Assessment Results</Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('landing');
              }}
            >
              <Home size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Score Breakdown</Text>
            <View style={[styles.chartWrapper, { backgroundColor: '#ffffff' }]}>
              <BarChart
                data={data}
                width={Dimensions.get("window").width - 80}
                height={240}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1, index) => {
                    const scoreEntry = scoreEntries[index];
                    const color = scoreEntry ? scoreEntry.color : '#000000';
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  },
                  labelColor: () => Colors.text,
                  barPercentage: 0.7,
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    strokeDasharray: '',
                  },
                  propsForVerticalLabels: {
                    fontSize: 12,
                  },
                  propsForHorizontalLabels: {
                    fontSize: 13,
                    fontWeight: '600',
                  },
                  count: 6,
                }}
                style={[styles.chart, {
                  marginVertical: 8,
                  borderRadius: 16,
                  paddingBottom: 8,
                }]}
                withInnerLines={true}
                showBarTops={true}
                fromZero={true}
                segments={5}
                maxValue={100}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detailed Scores</Text>
          {scoreEntries.map(({ category, score, color }) => (
            <View key={category} style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>{category}</Text>
              <View style={styles.scoreValueContainer}>
                <View style={[styles.scoreIndicator, { backgroundColor: color }]} />
                <Text style={[styles.scoreValue, { color: color }]}>{Math.round(score)}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { borderLeftColor: assessment.color, borderLeftWidth: 4 }]}>
          <View style={styles.assessmentHeader}>
            {assessment.icon}
            <Text style={styles.assessmentTitle}>Overall Assessment</Text>
          </View>
          <Text style={styles.assessmentText}>{assessment.text}</Text>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, isGeneratingPDF && styles.disabledButton]}
          onPress={handleGenerateReport}
          disabled={isGeneratingPDF}
        >
          <View style={styles.downloadButtonContent}>
            {isGeneratingPDF ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Download size={20} color={Colors.white} />
                <Text style={styles.downloadButtonText}>Download Report</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chartWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    paddingBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scoreCategory: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
    marginRight: 16,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  downloadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: Colors.grey,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  assessmentText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
});
