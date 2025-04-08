import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import { useEffect } from "react";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleThree() {
  const router = useRouter();
  const { moduleThreeAnswers, setModuleThreeAnswers, setCurrentModule, moduleThreeQuestions, setModuleThreeQuestions } = useUnderstandMeContext();

  useEffect(() => {
    // Enable screenshot prevention for this module
    setCurrentModule("module-three");

    // Cleanup when component unmounts
    return () => {
      setCurrentModule(null);
    };
  }, [setCurrentModule]);

  const options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  
  const QUESTION_POOL = [
    // Existing questions
    "I scrutinize email addresses and URLs before clicking on them.",
    "I double-check the legitimacy of unexpected email attachments.",
    "I prefer tasks that require careful analysis over those that are straightforward.",
    "I can easily detect inconsistencies in online information.",
    "I question the motives behind unsolicited online requests or offers.",
    // New questions
    "I meticulously verify the authenticity of emails claiming to be from official organizations.",
    "I cross-reference information from unsolicited messages with official sources before taking action.",
    "I pay attention to subtle discrepancies in email addresses or domain names.",
    "I am cautious about downloading attachments from unknown or unexpected emails.",
    "I recognize that legitimate organizations will not request sensitive information via unsecured channels.",
    "I am aware of the common tactics used in phishing scams, such as creating a sense of urgency.",
    "I regularly update and patch my devices to protect against known vulnerabilities.",
    "I understand the importance of using multi-factor authentication for online accounts.",
    "I can identify signs of secure websites, such as HTTPS and valid security certificates.",
    "I am skeptical of unsolicited messages that request immediate action or personal information."
  ];

  // Select random questions if not already selected
  useEffect(() => {
    if (moduleThreeQuestions.length === 0) {
      const indices = [...Array(QUESTION_POOL.length).keys()];
      const randomIndices = indices.sort(() => Math.random() - 0.5).slice(0, 5);
      setModuleThreeQuestions(randomIndices.map(i => QUESTION_POOL[i]));
    }
  }, [moduleThreeQuestions, setModuleThreeQuestions]);

  const handleAnswer = (questionIndex, option) => {
    setModuleThreeAnswers({
      ...moduleThreeAnswers,
      [`q${questionIndex + 1}`]: option
    });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-four");
  };

  const allQuestionsAnswered = moduleThreeQuestions.every((_, index) =>
    moduleThreeAnswers[`q${index + 1}`]
  );

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Cognitive Pattern Assessment</Text>
          </View>
        </View>

        {moduleThreeQuestions.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionTitle}>Question {index + 11}</Text>
            <Text style={styles.question}>
              {question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    moduleThreeAnswers[`q${index + 1}`] === option && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    moduleThreeAnswers[`q${index + 1}`] === option && styles.selectedOptionText
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