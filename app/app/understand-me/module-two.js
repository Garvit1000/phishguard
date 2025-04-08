import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useUnderstandMeContext } from "../../UnderstandMeContext.jsx";
import Colors from "../../../constants/colors";
import SafeAreaWrapper from "../../../components/layouts/SafeAreaWrapper";
import { Shield } from "lucide-react-native";

export default function ModuleTwo() {
  const router = useRouter();
  const { moduleTwoAnswers, setModuleTwoAnswers } = useUnderstandMeContext();

  const options = [
    "Click the link immediately",
    "Call the bank's official number",
    "Ignore and delete the email",
    "Forward to IT security team"
  ];

  const handleAnswer = (option) => {
    setModuleTwoAnswers({ ...moduleTwoAnswers, q1: option });
  };

  const handleNext = () => {
    router.push("/app/understand-me/module-three");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Phishing Susceptibility</Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>Scenario 1</Text>
          <Text style={styles.question}>
            You receive an email claiming your bank account is compromised. What would you do?
          </Text>
          
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  moduleTwoAnswers.q1 === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={[
                  styles.optionText,
                  moduleTwoAnswers.q1 === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Security Tip</Text>
          <Text style={styles.tipText}>
            Financial institutions will never ask you to click on links in emails to verify your account. Always contact your bank through official channels.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !moduleTwoAnswers.q1 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!moduleTwoAnswers.q1}
        >
          <Text style={styles.nextButtonText}>Next Scenario</Text>
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