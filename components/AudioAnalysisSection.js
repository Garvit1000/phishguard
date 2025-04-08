import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mic, File, X, Play, Pause, AlertTriangle, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import GeminiScamDetectionService from '@/services/GeminiScamDetectionService';

const AudioAnalysisSection = ({ onResultChange }) => {
  const [audioUri, setAudioUri] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Clean up sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

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
    setResult(null);
  };

  // Analyze audio for scams
  const analyzeAudio = async () => {
    if (!audioUri) return;
    
    setIsLoading(true);
    try {
      const analysisResult = await GeminiScamDetectionService.analyzeAudio(audioUri);
      setResult(analysisResult);
      
      // Notify parent component about the result
      if (onResultChange) {
        onResultChange(analysisResult);
      }
    } catch (error) {
      console.error('Audio analysis error:', error);
      setResult({
        isScam: false,
        reason: 'Error analyzing audio: ' + error.message,
        transcript: 'Analysis failed',
        detectedTactics: 'Unable to detect'
      });
      
      if (onResultChange) {
        onResultChange(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Audio Selection Area */}
      {!audioUri ? (
        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={pickAudio}
          activeOpacity={0.7}
        >
          <File size={32} color={Colors.primary} />
          <Text style={styles.uploadText}>Select audio file to analyze</Text>
          <Text style={styles.uploadSubtext}>MP3, WAV, OGG, or M4A</Text>
        </TouchableOpacity>
      ) : (
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
          
          <Button
            title={isLoading ? "Analyzing..." : "Analyze Audio"}
            onPress={analyzeAudio}
            style={styles.analyzeButton}
            disabled={isLoading}
          />
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
            
            {result.transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptTitle}>Transcript:</Text>
                <Text style={styles.transcriptText}>{result.transcript}</Text>
              </View>
            )}
            
            <Text style={styles.resultDescription}>{result.reason}</Text>
            
            {result.detectedTactics && (
              <View style={styles.tacticsContainer}>
                <Text style={styles.tacticsTitle}>Detected Tactics:</Text>
                <Text style={styles.tacticsText}>{result.detectedTactics}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing audio...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: `${Colors.primary}30`,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}10`,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 4,
  },
  audioPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  audioInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    margin: 16,
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
    marginTop: 16,
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
});

export default AudioAnalysisSection;