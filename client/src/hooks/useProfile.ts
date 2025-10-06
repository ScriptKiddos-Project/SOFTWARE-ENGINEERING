import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user, hydrated } = useAuthStore(); // ✅ added `hydrated`
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: profileData,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.getProfile(),
    enabled: hydrated && !!user, // ✅ hydration check
  });

  const {
    data: joinedClubsData,
  } = useQuery({
    queryKey: ['myClubs', user?.id],
    queryFn: () => profileService.getMyClubs(),
    enabled: hydrated && !!user, // ✅ hydration check
  });

  const {
    data: pointsHistoryData,
  } = useQuery({
    queryKey: ['pointsHistory', user?.id],
    queryFn: () => profileService.getPointsHistory(),
    enabled: hydrated && !!user, // ✅ hydration check
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const updateProfile = useCallback(
    async (data: any) => {
      if (!user) {
        toast.error('Please log in to update profile');
        return false;
      }
      try {
        await updateProfileMutation.mutateAsync(data);
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateProfileMutation, user]
  );

  const updateProfileImage = useCallback(
    async (file: File) => {
      if (!user) {
        toast.error('Please log in to update profile image');
        return false;
      }
      try {
        setIsLoading(true);
        await profileService.uploadAvatar(file);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Profile image updated successfully');
        return true;
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update profile image');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, user]
  );

  return {
    profile: profileData?.data,
    joinedClubs: joinedClubsData?.data || [],
    pointsHistory: pointsHistoryData?.data || [],
    isLoading,
    error: error as Error | null,
    refetch,
    updateProfile,
    updateProfileImage,
  };
};
