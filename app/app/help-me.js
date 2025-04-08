import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, CheckCircle, Camera, X, File, Mic, Play, Pause } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import SafeAreaWrapper from '@/components/layouts/SafeAreaWrapper';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import GeminiScamDetectionService from '@/services/GeminiScamDetectionService';

export default function HelpMeScreen() {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('text'); // 'text', 'image', or 'audio'
  const router = useRouter();

  // Clean up sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  // Request permissions and open image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('We need camera roll permissions to analyze images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisMode('image');
      // Clear other content and results
      setInputText('');
      setAudioUri(null);
      setAudioName('');
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
      setResult(null);
    }
  };

  // Pick audio file
  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Audio selected:', asset);
        setAudioUri(asset.uri);
        setAudioName(asset.name);
        setAnalysisMode('audio');
        
        // Clear other content and results
        setInputText('');
        setSelectedImage(null);
        setResult(null);
        
        // Create new sound object
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
        }
        
        loadSound(asset.uri);
      }
    } catch (error) {
      console.error('Error picking audio:', error);
      alert('Error selecting audio file');
    }
  };

  // Load sound from uri
  const loadSound = async (uri) => {
    try {
      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      
      // Set up status update listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  // Play/pause audio
  const togglePlayback = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        console.log('Pausing Sound');
        await sound.pauseAsync();
      } else {
        console.log('Playing Sound');
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    if (analysisMode === 'image') {
      setAnalysisMode('text');
    }
    setResult(null);
  };

  // Clear selected audio
  const clearAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    setSound(null);
    setAudioUri(null);
    setAudioName('');
    setIsPlaying(false);
    if (analysisMode === 'audio') {
      setAnalysisMode('text');
    }
    setResult(null);
  };

  // Handle text input
  const handleTextChange = (text) => {
    setInputText(text);
    if (text.trim().length > 0 && analysisMode !== 'text') {
      setAnalysisMode('text');
      setSelectedImage(null);
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
      setAudioUri(null);
      setAudioName('');
    }
  };

  // Analyze content (text, image, or audio)
  const analyzeContent = async () => {
    setIsLoading(true);
    try {
      let analysisResult;
      
      if (analysisMode === 'text' && inputText.trim().length > 0) {
        // Analyze text
        analysisResult = await GeminiScamDetectionService.analyzeContent(inputText);
      } else if (analysisMode === 'image' && selectedImage) {
        // Analyze image
        analysisResult = await GeminiScamDetectionService.analyzeImage(selectedImage);
      } else if (analysisMode === 'audio' && audioUri) {
        // Analyze audio
        analysisResult = await GeminiScamDetectionService.analyzeAudio(audioUri);
      } else {
        throw new Error('No content to analyze');
      }
      
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        isScam: false,
        reason: 'Error analyzing content: ' + error.message,
        transcript: analysisMode === 'audio' ? 'Analysis failed' : undefined,
        detectedTactics: analysisMode === 'audio' ? 'Unable to detect' : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if analyze button should be enabled
  const isAnalyzeButtonEnabled = () => {
    if (isLoading) return false;
    if (analysisMode === 'text') return inputText.trim().length >= 5;
    if (analysisMode === 'image') return !!selectedImage;
    if (analysisMode === 'audio') return !!audioUri;
    return false;
  };

  return (
    <SafeAreaWrapper>
      <Stack.Screen 
        options={{
          title: 'Help Me',
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
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.title}>Analyze Suspicious Content</Text>
          <Text style={styles.description}>
            Paste suspicious text, select an image, or upload audio to analyze for potential scams.
          </Text>
        </View>
        
        {/* Input Selection Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, analysisMode === 'text' && styles.activeTab]}
            onPress={() => {
              setAnalysisMode('text');
              setSelectedImage(null);
              clearAudio();
            }}
          >
            <File size={18} color={analysisMode === 'text' ? Colors.primary : Colors.darkGray} />
            <Text style={[styles.tabText, analysisMode === 'text' && styles.activeTabText]}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, analysisMode === 'image' && styles.activeTab]}
            onPress={pickImage}
          >
            <Camera size={18} color={analysisMode === 'image' ? Colors.primary : Colors.darkGray} />
            <Text style={[styles.tabText, analysisMode === 'image' && styles.activeTabText]}>Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, analysisMode === 'audio' && styles.activeTab]}
            onPress={pickAudio}
          >
            <Mic size={18} color={analysisMode === 'audio' ? Colors.primary : Colors.darkGray} />
            <Text style={[styles.tabText, analysisMode === 'audio' && styles.activeTabText]}>Audio</Text>
          </TouchableOpacity>
        </View>
        
        {/* Input Container */}
        <View style={styles.inputContainer}>
          {/* Text Input */}
          {analysisMode === 'text' && (
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={8}
              placeholder="Paste suspicious content here..."
              value={inputText}
              onChangeText={handleTextChange}
              textAlignVertical="top"
            />
          )}
          
          {/* Image Preview */}
          {analysisMode === 'image' && selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.clearImageButton} onPress={clearImage}>
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Audio Preview */}
          {analysisMode === 'audio' && audioUri && (
            <View style={styles.audioPreviewContainer}>
              <View style={styles.audioInfoContainer}>
                <Text style={styles.audioName} numberOfLines={1} ellipsizeMode="middle">
                  {audioName}
                </Text>
                
                <View style={styles.audioControlsContainer}>
                  <TouchableOpacity 
                    style={styles.playButton} 
                    onPress={togglePlayback}
                  >
                    {isPlaying ? (
                      <Pause size={18} color={Colors.white} />
                    ) : (
                      <Play size={18} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearAudio}
                  >
                    <X size={18} color={Colors.darkGray} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Analyze Button */}
          <Button
            title={isLoading ? "Analyzing..." : "Analyze"}
            onPress={analyzeContent}
            style={styles.analyzeButton}
            disabled={!isAnalyzeButtonEnabled()}
          />
        </View>
        
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {analysisMode === 'text' ? 'Analyzing text...' : 
              analysisMode === 'image' ? 'Analyzing image...' : 'Analyzing audio...'}
            </Text>
          </View>
        )}
        
        {/* Analysis Result */}
        {result && (
          <View style={[
            styles.resultContainer,
            result.isScam ? styles.scamResult : styles.safeResult
          ]}>
            <View style={styles.resultIconContainer}>
              {result.isScam ? (
                <AlertTriangle size={24} color={Colors.error} />
              ) : (
                <CheckCircle size={24} color={Colors.success} />
              )}
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>
                {result.isScam ? 'Potential Scam Detected' : 'Likely Legitimate'}
              </Text>
              
              {/* Display transcript for audio analysis */}
              {analysisMode === 'audio' && result.transcript && (
                <View style={styles.transcriptContainer}>
                  <Text style={styles.transcriptTitle}>Transcript:</Text>
                  <Text style={styles.transcriptText}>{result.transcript}</Text>
                </View>
              )}
              
              <Text style={styles.resultDescription}>{result.reason}</Text>
              
              {/* Display detected elements for image analysis */}
              {analysisMode === 'image' && result.detectedElements && (
                <View style={styles.detectedElementsContainer}>
                  <Text style={styles.detectedElementsTitle}>Detected Elements:</Text>
                  <Text style={styles.detectedElementsText}>{result.detectedElements}</Text>
                </View>
              )}
              
              {/* Display detected tactics for audio analysis */}
              {analysisMode === 'audio' && result.detectedTactics && (
                <View style={styles.tacticsContainer}>
                  <Text style={styles.tacticsTitle}>Detected Tactics:</Text>
                  <Text style={styles.tacticsText}>{result.detectedTactics}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Check for spelling and grammar errors</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Verify sender email addresses carefully</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Be suspicious of urgent requests or threats</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Don't click on suspicious links or attachments</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Beware of calls claiming to be from official organizations</Text>
          </View>
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
  backButton: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: `${Colors.primary}20`,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.darkGray,
  },
  activeTabText: {
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  audioInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  audioName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  audioControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButton: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.darkGray,
  },
  resultContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  scamResult: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  safeResult: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  resultDescription: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  transcriptContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  transcriptText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  detectedElementsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detectedElementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  detectedElementsText: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  tacticsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tacticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  tacticsText: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.text,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
});