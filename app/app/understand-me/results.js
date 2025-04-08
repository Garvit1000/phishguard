import { View, Text, Dimensions, StyleSheet, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield, Star, AlertTriangle, CheckCircle } from "lucide-react-native";
import FirebaseService from "../../../services/FirebaseService";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Results() {
  const {
    moduleOneAnswers,
    moduleTwoAnswers,
    moduleThreeAnswers
  } = useUnderstandMeContext();

  const calculatePersonalityScore = () => {
    if (!moduleOneAnswers.q1) return 0;
    const scores = {
      "Strongly Agree": 100,
      "Agree": 75,
      "Neutral": 50,
      "Disagree": 25,
      "Strongly Disagree": 0
    };
    return scores[moduleOneAnswers.q1] || 0;
  };

  const calculatePhishingScore = () => {
    if (!moduleTwoAnswers.q1) return 0;
    const scores = {
      "Call the bank's official number": 100,
      "Forward to IT security team": 75,
      "Ignore and delete the email": 50,
      "Click the link immediately": 0
    };
    return scores[moduleTwoAnswers.q1] || 0;
  };

  const calculateBehaviorScore = () => {
    if (!moduleThreeAnswers.q1) return 0;
    const scores = {
      "Create a detailed plan and follow it": 100,
      "Seek help from colleagues": 75,
      "Push back on the deadline": 50,
      "Work faster and longer hours": 25
    };
    return scores[moduleThreeAnswers.q1] || 0;
  };

  // Calculate and save scores
  useEffect(() => {
    const scores = {
      Personality: calculatePersonalityScore(),
      Phishing: calculatePhishingScore(),
      Behavior: calculateBehaviorScore()
    };

    const saveResults = async () => {
      try {
        // Get userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        // Save test results
        await FirebaseService.saveTestResults(userId, {
          moduleOne: moduleOneAnswers,
          moduleTwo: moduleTwoAnswers,
          moduleThree: moduleThreeAnswers,
          scores: {
            personality: scores.Personality,
            phishing: scores.Phishing,
            behavior: scores.Behavior
          }
        });
      } catch (error) {
        console.error('Error saving test results:', error);
      }
    };

    saveResults();
  }, [moduleOneAnswers, moduleTwoAnswers, moduleThreeAnswers]);

  const scores = {
    Personality: calculatePersonalityScore(),
    Phishing: calculatePhishingScore(),
    Behavior: calculateBehaviorScore()
  };

  const data = {
    labels: ["Personality", "Phishing", "Behavior"],
    datasets: [{
      data: [scores.Personality, scores.Phishing, scores.Behavior],
      color: () => Colors.primary,
    }],
  };

  const getOverallAssessment = () => {
    const avgScore = (scores.Personality + scores.Phishing + scores.Behavior) / 3;
    if (avgScore >= 75) return {
      icon: <Star size={24} color={Colors.success} />,
      text: "Excellent understanding of security practices!",
      color: Colors.success
    };
    if (avgScore >= 50) return {
      icon: <CheckCircle size={24} color={Colors.primary} />,
      text: "Good awareness, but room for improvement.",
      color: Colors.primary
    };
    return {
      icon: <AlertTriangle size={24} color={Colors.warning} />,
      text: "Consider reviewing basic security practices.",
      color: Colors.warning
    };
  };

  const assessment = getOverallAssessment();

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Assessment Results</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Score Breakdown</Text>
            <View style={[styles.chartWrapper, { backgroundColor: '#ffffff' }]}>
              <BarChart
                data={data}
                width={Dimensions.get("window").width - 80}
                height={220}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: () => Colors.primary,
                  labelColor: () => Colors.text,
                  barPercentage: 0.7,
                  useShadowColorFromDataset: false,
                }}
                style={styles.chart}
                withInnerLines={false}
                showBarTops={false}
                fromZero
                segments={5}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detailed Scores</Text>
          {Object.entries(scores).map(([category, score]) => {
            const indicatorColor = score >= 75 ? Colors.success :
                                 score >= 50 ? Colors.primary :
                                 Colors.warning;
            return (
              <View key={category} style={styles.scoreItem}>
                <Text style={styles.scoreCategory}>{category}</Text>
                <View style={styles.scoreValueContainer}>
                  <View style={[styles.scoreIndicator, { backgroundColor: indicatorColor }]} />
                  <Text style={[styles.scoreValue, { color: indicatorColor }]}>{score}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { borderLeftColor: assessment.color }]}>
          <View style={styles.assessmentHeader}>
            {assessment.icon}
            <Text style={styles.assessmentTitle}>Overall Assessment</Text>
          </View>
          <Text style={styles.assessmentText}>{assessment.text}</Text>
        </View>
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
});