// client/src/hooks/useClubs.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '../services/clubService';
// import { Club } from '../types/club';
import { ClubFilters } from '../types/club';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export const useClubs = (filters?: ClubFilters) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [currentFilters, setCurrentFilters] = useState<ClubFilters>(filters || {});

  const {
    data: clubsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clubs', currentFilters],
    queryFn: () => clubService.getClubs(currentFilters),
  });

  const joinClubMutation = useMutation({
    mutationFn: (clubId: string) => clubService.joinClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['myClubs'] });
      toast.success('Successfully joined the club!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to join club');
    },
  });

  const leaveClubMutation = useMutation({
    mutationFn: (clubId: string) => clubService.leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['myClubs'] });
      toast.success('Successfully left the club');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to leave club');
    },
  });

  const joinClub = useCallback(
    async (clubId: string) => {
      if (!user) {
        toast.error('Please log in to join clubs');
        return;
      }
      await joinClubMutation.mutateAsync(clubId);
    },
    [joinClubMutation, user]
  );

  const leaveClub = useCallback(
    async (clubId: string) => {
      if (!user) {
        toast.error('Please log in to leave clubs');
        return;
      }
      await leaveClubMutation.mutateAsync(clubId);
    },
    [leaveClubMutation, user]
  );

  const updateFilters = useCallback((newFilters: ClubFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    clubs: clubsData?.data || [],
    isLoading,
    error: error as Error | null,
    refetch,
    joinClub,
    leaveClub,
    updateFilters,
    filters: currentFilters,
  };
};