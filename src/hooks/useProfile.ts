import { useEffect, useState } from 'react';
import { useAuth } from 'miaoda-auth-react';
import { profilesApi } from '@/db/api';
import type { Profile } from '@/types/database';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await profilesApi.getCurrentProfile();
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, refetch: loadProfile };
}
