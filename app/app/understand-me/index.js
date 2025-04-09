import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function UnderstandMeIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Use replace instead of redirect to handle the navigation
    router.replace('/app/understand-me/module-one');
  }, []);

  return null;
}