import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleOne() {
  const router = useRouter();
  const { moduleOneAnswers, setModuleOneAnswers } = useUnderstandMeContext();

  const options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

  const handleAnswer = (option) => {
    setModuleOneAnswers({ ...moduleOneAnswers, q1: option });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-two");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Personality Assessment</Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>Question 1</Text>
          <Text style={styles.question}>
            I enjoy meeting new people.
          </Text>
          
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  moduleOneAnswers.q1 === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={[
                  styles.optionText,
                  moduleOneAnswers.q1 === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Why This Matters</Text>
          <Text style={styles.tipText}>
            Understanding your personality traits helps us assess how you might interact with potential phishing attempts and customize our security recommendations.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !moduleOneAnswers.q1 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!moduleOneAnswers.q1}
        >
          <Text style={styles.nextButtonText}>Next Question</Text>
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
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  optionsContainer: {
    marginTop: 16,
  },
  option: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: Colors.white,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.white,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: Colors.grey,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});