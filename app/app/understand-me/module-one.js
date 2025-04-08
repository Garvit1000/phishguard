import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import { useEffect } from "react";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleOne() {
  const router = useRouter();
  const { moduleOneAnswers, setModuleOneAnswers, setCurrentModule, moduleOneQuestions, setModuleOneQuestions } = useUnderstandMeContext();

  useEffect(() => {
    // Enable screenshot prevention for this module
    setCurrentModule("module-one");

    // Cleanup when component unmounts
    return () => {
      setCurrentModule(null);
    };
  }, [setCurrentModule]);

  const options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  
  const QUESTION_POOL = [
    // Existing questions
    "I enjoy exploring new technologies and applications.",
    "When uncertain about an email's authenticity, I consult with colleagues or friends.",
    "I actively participate in discussions about online security and privacy.",
    "Building trust with online contacts is important to me.",
    "I often share articles or information about cybersecurity with others.",
    // New questions
    "I frequently discuss online security practices with friends or family.",
    "I feel comfortable sharing my online experiences, including mistakes, to help others learn.",
    "I actively seek advice from colleagues or peers when encountering unfamiliar online situations.",
    "I participate in community forums or groups focused on cybersecurity awareness.",
    "I believe that sharing knowledge about online threats can help in preventing scams.",
    "I encourage others to report suspicious online activities to relevant authorities.",
    "I stay updated with the latest news on cybersecurity incidents and threats.",
    "I have attended workshops or seminars on online safety and cybersecurity.",
    "I collaborate with others to understand and mitigate potential online risks.",
    "I believe that open conversations about online vulnerabilities can lead to better protection strategies."
  ];

  // Select random questions if not already selected
  useEffect(() => {
    if (moduleOneQuestions.length === 0) {
      const indices = [...Array(QUESTION_POOL.length).keys()];
      const randomIndices = indices.sort(() => Math.random() - 0.5).slice(0, 5);
      setModuleOneQuestions(randomIndices.map(i => QUESTION_POOL[i]));
    }
  }, [moduleOneQuestions, setModuleOneQuestions]);

  const handleAnswer = (questionIndex, option) => {
    setModuleOneAnswers({
      ...moduleOneAnswers,
      [`q${questionIndex + 1}`]: option
    });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-two");
  };

  const allQuestionsAnswered = moduleOneQuestions.every((_, index) =>
    moduleOneAnswers[`q${index + 1}`]
  );

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Report-Building Assessment</Text>
          </View>
        </View>

        {moduleOneQuestions.map((question, index) => (
          <View key={index} style={styles.questionCard}>
            <Text style={styles.questionTitle}>Question {index + 1}</Text>
            <Text style={styles.question}>
              {question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    moduleOneAnswers[`q${index + 1}`] === option && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(index, option)}
                >
                  <Text style={[
                    styles.optionText,
                    moduleOneAnswers[`q${index + 1}`] === option && styles.selectedOptionText
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