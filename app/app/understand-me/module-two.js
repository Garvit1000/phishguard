import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import { useEffect } from "react";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleTwo() {
  const router = useRouter();
  const { moduleTwoAnswers, setModuleTwoAnswers, setCurrentModule, moduleTwoQuestions, setModuleTwoQuestions } = useUnderstandMeContext();

  useEffect(() => {
    // Enable screenshot prevention for this module
    setCurrentModule("module-two");

    // Cleanup when component unmounts
    return () => {
      setCurrentModule(null);
    };
  }, [setCurrentModule]);

  const options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  
  const QUESTION_POOL = [
    // Existing questions
    "I tend to make quick decisions when browsing online.",
    "I generally trust emails from familiar organizations without verifying their authenticity.",
    "I prefer sticking to familiar websites rather than exploring new ones.",
    "I find it easy to persuade others to see things from my perspective.",
    "I often seek out new online experiences and platforms.",
    // New questions
    "I often act on emails that create a sense of urgency without verifying their authenticity.",
    "I tend to trust messages from unknown senders if they appear professional.",
    "I am more likely to engage with online offers that promise significant rewards with minimal effort.",
    "I believe that most online threats are exaggerated and do not require much attention.",
    "I prefer convenience over security when setting up online accounts or devices.",
    "I rarely question the legitimacy of unexpected online communications.",
    "I feel confident in my ability to identify scams without formal training.",
    "I often share personal achievements or purchases on social media without considering privacy settings.",
    "I believe that cybersecurity measures are more relevant for organizations than individuals.",
    "I am comfortable using the same password across multiple online platforms for ease of access."
  ];

  // Select random questions if not already selected
  useEffect(() => {
    if (moduleTwoQuestions.length === 0) {
      const indices = [...Array(QUESTION_POOL.length).keys()];
      const randomIndices = indices.sort(() => Math.random() - 0.5).slice(0, 5);
      setModuleTwoQuestions(randomIndices.map(i => QUESTION_POOL[i]));
    }
  }, [moduleTwoQuestions, setModuleTwoQuestions]);

  const handleAnswer = (questionIndex, option) => {
    setModuleTwoAnswers({
      ...moduleTwoAnswers,
      [`q${questionIndex + 1}`]: option
    });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-three");
  };

  const allQuestionsAnswered = moduleTwoQuestions.every((_, index) =>
    moduleTwoAnswers[`q${index + 1}`]
  );

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Personality-Based Assessment</Text>
          </View>
        </View>

        {moduleTwoQuestions.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionTitle}>Question {index + 6}</Text>
            <Text style={styles.question}>
              {question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    moduleTwoAnswers[`q${index + 1}`] === option && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    moduleTwoAnswers[`q${index + 1}`] === option && styles.selectedOptionText
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
          <Text style={styles.nextButtonText}>Next Module</Text>
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