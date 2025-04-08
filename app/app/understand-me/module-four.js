import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import { useEffect } from "react";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleFour() {
  const router = useRouter();
  const { moduleFourAnswers, setModuleFourAnswers, setCurrentModule, moduleFourQuestions, setModuleFourQuestions } = useUnderstandMeContext();

  useEffect(() => {
    // Enable screenshot prevention for this module
    setCurrentModule("module-four");

    // Cleanup when component unmounts
    return () => {
      setCurrentModule(null);
    };
  }, [setCurrentModule]);

  const options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  
  const QUESTION_POOL = [
    // Existing questions
    "I enjoy taking risks, even if there's potential for negative outcomes.",
    "I have, at times, bypassed security protocols for convenience.",
    "I am comfortable sharing personal information on websites that offer value.",
    "I have engaged in online activities that others might consider risky.",
    "I believe that taking chances online is sometimes necessary to achieve goals.",
    // New questions
    "I have clicked on links in emails without verifying their source.",
    "I have provided personal information on websites without checking their legitimacy.",
    "I have engaged in online transactions over public Wi-Fi networks without using a VPN.",
    "I have ignored browser warnings about potentially unsafe websites.",
    "I have used the same password for multiple sensitive accounts.",
    "I have downloaded software or apps from unofficial or unverified sources.",
    "I have shared sensitive information over the phone without confirming the caller's identity.",
    "I have bypassed security protocols at work or school for convenience.",
    "I have responded to online offers that seemed too good to be true.",
    "I have neglected to log out from shared or public computers after accessing personal accounts."
  ];

  // Select random questions if not already selected
  useEffect(() => {
    if (moduleFourQuestions.length === 0) {
      const indices = [...Array(QUESTION_POOL.length).keys()];
      const randomIndices = indices.sort(() => Math.random() - 0.5).slice(0, 5);
      setModuleFourQuestions(randomIndices.map(i => QUESTION_POOL[i]));
    }
  }, [moduleFourQuestions, setModuleFourQuestions]);

  const handleAnswer = (questionIndex, option) => {
    setModuleFourAnswers({
      ...moduleFourAnswers,
      [`q${questionIndex + 1}`]: option
    });
  };

  const handleNext = () => {
    router.push("/app/understand-me/results");
  };

  const allQuestionsAnswered = moduleFourQuestions.every((_, index) =>
    moduleFourAnswers[`q${index + 1}`]
  );

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Risk-Taking Assessment</Text>
          </View>
        </View>

        {moduleFourQuestions.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionTitle}>Question {index + 16}</Text>
            <Text style={styles.question}>
              {question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    moduleFourAnswers[`q${index + 1}`] === option && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    moduleFourAnswers[`q${index + 1}`] === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}


        <TouchableOpacity
          style={[
            styles.nextButton,
            !allQuestionsAnswered && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!allQuestionsAnswered}
        >
          <Text style={styles.nextButtonText}>View Results</Text>
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
    fontSize: 18,
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