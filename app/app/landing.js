import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LifeBuoy, BookOpen, Brain, LogOut, Shield } from 'lucide-react-native';
import SafeAreaWrapper from '@/components/layouts/SafeAreaWrapper';
import OptionCard from '@/components/ui/OptionCard';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

export default function LandingScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{user?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>How can we help you today?</Text>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <OptionCard
            title="Help Me"
            description="Get immediate assistance with potential phishing threats"
            icon={<LifeBuoy size={28} color={Colors.primary} />}
            onPress={() => router.push('/app/help-me')}
          />
          
          <OptionCard
            title="Understand Me"
            description="Learn about phishing attacks and how to identify them"
            icon={<BookOpen size={28} color={Colors.primary} />}
            onPress={() => router.push('/app/understand-me')}
          />
          
          <OptionCard
            title="Train Me"
            description="Practice identifying phishing attempts with simulations"
            icon={<Brain size={28} color={Colors.primary} />}
            onPress={() => router.push('/app/train-me')}
          />
          
          <View style={styles.securityTip}>
            <Text style={styles.tipTitle}>Security Tip</Text>
            <Text style={styles.tipText}>
              Always check the sender's email address carefully. Legitimate organizations will use official domain names, not public email services.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  welcomeText: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  securityTip: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
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
});