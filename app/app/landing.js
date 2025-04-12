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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 16,
  },
  securityTip: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
  },
});