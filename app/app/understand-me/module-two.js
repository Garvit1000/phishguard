import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleTwo() {
  const router = useRouter();
  const { moduleTwoAnswers, setModuleTwoAnswers } = useUnderstandMeContext();

  const options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
  
  const questions = [
    "I tend to make quick decisions when browsing online.",
    "I generally trust emails from familiar organizations without verifying their authenticity.",
    "I prefer sticking to familiar websites rather than exploring new ones.",
    "I find it easy to persuade others to see things from my perspective.",
    "I often seek out new online experiences and platforms."
  ];

  const handleAnswer = (questionIndex, option) => {
    setModuleTwoAnswers({
      ...moduleTwoAnswers,
      [`q${questionIndex + 1}`]: option
    });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-three");
  };

  const allQuestionsAnswered = questions.every((_, index) => 
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

        {questions.map((question, index) => (
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

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Scoring Information</Text>
          <Text style={styles.tipText}>
            Your responses will be scored as follows:{'\n'}
            Never: 1 point{'\n'}
            Rarely: 2 points{'\n'}
            Sometimes: 3 points{'\n'}
            Often: 4 points{'\n'}
            Always: 5 points
          </Text>
        </View>

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