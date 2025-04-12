import { View, Text, Dimensions, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield, Star, AlertTriangle, CheckCircle, Download, Home } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import PDFGenerationService from "../../../services/PDFGenerationService";
import FirebaseService from "../../../services/FirebaseService";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Calculate and save scores
  useEffect(() => {
    const saveResults = async () => {
      try {
        // Get userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        // Ensure we have all required data
        if (!moduleOneAnswers || !moduleTwoAnswers || !moduleThreeAnswers || !moduleFourAnswers) {
          console.error('Missing module answers');
          return;
        }

        // Save test results with complete data structure
        await FirebaseService.saveTestResults(userId, {
          moduleOne: moduleOneAnswers,
          moduleTwo: moduleTwoAnswers,
          moduleThree: moduleThreeAnswers,
          moduleFour: moduleFourAnswers,
          scores: {
            Report: moduleScores.Report || 0,
            Behavior: moduleScores.Behavior || 0,
            Cognition: moduleScores.Cognition || 0,
            Risk: moduleScores.Risk || 0
          }
        });
      } catch (error) {
        console.error('Error saving test results:', error);
        Alert.alert(
          "Save Error",
          "Failed to save test results. Please try again.",
          [{ text: "OK" }]
        );
      }
    };

    // Only try to save if we have scores calculated
    if (Object.keys(moduleScores).length > 0) {
      saveResults();
    }
  }, [moduleOneAnswers, moduleTwoAnswers, moduleThreeAnswers, moduleFourAnswers]);

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
                <Text style={[styles.scoreValue, { color }]}>{Math.round(score)}%</Text>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
  scoreValue: {
    fontSize: 16,
    color: Colors.primary,
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
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
    gap: 8,
    width: '100%',
  },
  downloadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.grey,
  },
});