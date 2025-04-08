import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Mail, RefreshCw } from 'lucide-react-native';
import SafeAreaWrapper from '@/components/layouts/SafeAreaWrapper';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import FirebaseService from '@/services/FirebaseService';
import geminiTraining from '@/services/GeminiTrainingService';
import { useAuthStore } from '@/stores/auth-store';
import { useUnderstandMeContext } from '../UnderstandMeContext';

export default function TrainMeScreen() {
  const router = useRouter();
  const [currentExample, setCurrentExample] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showExplanation, setShowExplanation] = useState(false);
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const { moduleOneAnswers, moduleTwoAnswers, moduleThreeAnswers } = useUnderstandMeContext();
  const { user } = useAuthStore();

  const generateTrainingExamples = async (testResults) => {
    const generatedExamples = [];
    const totalExamples = 5;
    let retries = 0;
    const maxRetries = 10;

    while (generatedExamples.length < totalExamples && retries < maxRetries) {
      try {
        console.log(`Generating example ${generatedExamples.length + 1}/${totalExamples}`);
        // Calculate skill level and focus areas based on test scores
        let skillLevel = 'basic';
        if (testResults.scores.phishing > 90) {
          skillLevel = 'expert';
        } else if (testResults.scores.phishing > 75) {
          skillLevel = 'advanced';
        } else if (testResults.scores.phishing > 50) {
          skillLevel = 'intermediate';
        }

        // Analyze weak areas from test results
        const weakAreas = [];
        if (testResults.scores.financial < 70) weakAreas.push('financial');
        if (testResults.scores.impersonation < 70) weakAreas.push('impersonation');
        if (testResults.scores.malware < 70) weakAreas.push('malware');
        if (testResults.scores.social < 70) weakAreas.push('social');
        if (testResults.scores.credential < 70) weakAreas.push('credential');

        const exampleResponse = await geminiTraining.generateTrainingExample(skillLevel, {
          weakAreas,
          testScores: testResults.scores,
          previousAnswers: {
            moduleOne: moduleOneAnswers,
            moduleTwo: moduleTwoAnswers,
            moduleThree: moduleThreeAnswers
          }
        });
        
        if (exampleResponse && exampleResponse.sender && exampleResponse.subject && exampleResponse.content) {
          const example = {
            id: Date.now() + generatedExamples.length,
            ...exampleResponse
          };

          console.log('Created example:', example);
          
          await FirebaseService.saveTrainingSession(user.uid, {
            example,
            testResults: testResults.scores,
            timestamp: new Date().toISOString()
          });

          generatedExamples.push(example);
        }
      } catch (error) {
        console.error('Example generation failed:', error);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      }
    }

    if (generatedExamples.length < 3) {
      throw new Error('Could not generate enough training examples');
    }

    return generatedExamples;
  };

  const loadExamples = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) {
        throw new Error('Please log in to access training');
      }

      console.log('Fetching test results...');
      const testResults = await FirebaseService.getTestResults(user.uid);
      
      if (!testResults) {
        throw new Error('Please complete the understand-me test first');
      }

      console.log('Generating examples...');
      const newExamples = await generateTrainingExamples(testResults);
      console.log(`Generated ${newExamples.length} examples`);
      
      setExamples(newExamples);
      setCurrentExample(0);
      setScore({ correct: 0, total: 0 });
    } catch (error) {
      console.error('Failed to load examples:', error);
      Alert.alert(
        "Training Setup",
        error.message || "Failed to set up training. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => {
              setRetryCount(prev => {
                if (prev < 2) {
                  loadExamples();
                  return prev + 1;
                }
                return prev;
              });
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamples();
  }, []);

  const handleAnswer = (isPhishing) => {
    setSelectedAnswer(isPhishing);
    setShowExplanation(true);
    
    const currentScenario = examples[currentExample];
    if (isPhishing === currentScenario.isScam) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const nextExample = () => {
    if (currentExample < examples.length - 1) {
      setCurrentExample(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Directly navigate to home page when training is complete
      router.replace("/app/landing");
    }
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Generating personalized training examples...
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const example = examples[currentExample];
  if (!example) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No training examples available</Text>
          <Button 
            title="Retry" 
            onPress={loadExamples}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Stack.Screen 
        options={{
          title: 'Security Training',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analyze this Email</Text>
          <Text style={styles.subtitle}>
            Is this a legitimate email or a potential security threat?
          </Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score.correct}/{score.total}</Text>
            <TouchableOpacity style={styles.resetButton} onPress={loadExamples}>
              <RefreshCw size={16} color={Colors.primary} />
              <Text style={styles.resetText}>New Examples</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.emailContainer}>
          <View style={styles.emailHeader}>
            <Mail size={20} color={Colors.darkGray} style={styles.emailIcon} />
            <View style={styles.emailDetails}>
              <Text style={styles.emailSender}>From: {example.sender}</Text>
              <Text style={styles.emailSubject}>Subject: {example.subject}</Text>
            </View>
          </View>
          
          <View style={styles.emailBody}>
            <Text style={styles.emailContent}>{example.content}</Text>
          </View>
        </ScrollView>
        
        {!showExplanation ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.legitimateButton]}
              onPress={() => handleAnswer(false)}
            >
              <CheckCircle size={24} color={Colors.success} />
              <Text style={styles.actionButtonText}>Legitimate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.phishingButton]}
              onPress={() => handleAnswer(true)}
            >
              <AlertTriangle size={24} color={Colors.error} />
              <Text style={styles.actionButtonText}>Security Threat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.explanationContainer}>
            <View style={[
              styles.resultBanner,
              selectedAnswer === example.isScam ? styles.correctBanner : styles.incorrectBanner
            ]}>
              {selectedAnswer === example.isScam ? (
                <View style={styles.resultContent}>
                  <CheckCircle size={20} color={Colors.success} />
                  <Text style={styles.resultText}>Correct!</Text>
                </View>
              ) : (
                <View style={styles.resultContent}>
                  <XCircle size={20} color={Colors.error} />
                  <Text style={styles.resultText}>Incorrect</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.explanationTitle}>
              {example.isScam ? 'This is a security threat' : 'This is legitimate'}
            </Text>
            <Text style={styles.explanationText}>{example.reason}</Text>
            
            <Button
              title={currentExample < examples.length - 1 ? "Next Example" : "Finish Training"}
              onPress={nextExample}
              style={styles.nextButton}
            />
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  backButton: {
    marginLeft: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emailContainer: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emailIcon: {
    marginRight: 12,
  },
  emailDetails: {
    flex: 1,
  },
  emailSender: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emailBody: {
    padding: 16,
  },
  emailContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  legitimateButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  phishingButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '45%',  // Limit height to ensure button is visible
    overflow: 'scroll' // Make content scrollable if it overflows
  },
  resultBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  correctBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  incorrectBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  nextButton: {
    marginTop: 8,
  },
});