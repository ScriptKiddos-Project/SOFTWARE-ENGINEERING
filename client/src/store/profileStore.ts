import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  UserProfile, 
  ClubMembership, 
  PointsHistory, 
  Badge, 
  VolunteerActivity,
  ProfileStats 
} from '../types/user';

interface ProfileState {
  // Profile data
  profile: UserProfile | null;
  clubs: ClubMembership[];
  pointsHistory: PointsHistory[];
  badges: Badge[];
  volunteerActivities: VolunteerActivity[];
  stats: ProfileStats | null;

  // Loading states
  loading: boolean;
  clubsLoading: boolean;
  pointsLoading: boolean;
  badgesLoading: boolean;
  activitiesLoading: boolean;

  // Error states
  error: string | null;
  clubsError: string | null;
  pointsError: string | null;
  badgesError: string | null;
  activitiesError: string | null;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Clubs
  setClubs: (clubs: ClubMembership[]) => void;
  addClub: (club: ClubMembership) => void;
  removeClub: (clubId: string) => void;
  updateClubRole: (clubId: string, role: string) => void;

  // Points
  setPointsHistory: (history: PointsHistory[]) => void;
  addPointsEntry: (entry: PointsHistory) => void;
  updateTotalPoints: (points: number) => void;

  // Badges
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;

  // Volunteer activities
  setVolunteerActivities: (activities: VolunteerActivity[]) => void;
  addVolunteerActivity: (activity: VolunteerActivity) => void;
  updateTotalVolunteerHours: (hours: number) => void;

  // Stats
  setStats: (stats: ProfileStats) => void;
  updateStats: (updates: Partial<ProfileStats>) => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setClubsLoading: (loading: boolean) => void;
  setPointsLoading: (loading: boolean) => void;
  setBadgesLoading: (loading: boolean) => void;
  setActivitiesLoading: (loading: boolean) => void;

  // Error handling
  setError: (error: string | null) => void;
  setClubsError: (error: string | null) => void;
  setPointsError: (error: string | null) => void;
  setBadgesError: (error: string | null) => void;
  setActivitiesError: (error: string | null) => void;
  clearErrors: () => void;

  // Utilities
  clearProfile: () => void;
  refreshProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: null,
        clubs: [],
        pointsHistory: [],
        badges: [],
        volunteerActivities: [],
        stats: null,

        // Loading states
        loading: false,
        clubsLoading: false,
        pointsLoading: false,
        badgesLoading: false,
        activitiesLoading: false,

        // Error states
        error: null,
        clubsError: null,
        pointsError: null,
        badgesError: null,
        activitiesError: null,

        // Profile actions
        setProfile: (profile) => {
          set({ profile }, false, 'setProfile');
        },

        updateProfile: (updates) => {
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null
          }), false, 'updateProfile');
        },

        // Club actions
        setClubs: (clubs) => {
          set({ clubs }, false, 'setClubs');
        },

        addClub: (club) => {
          set((state) => ({
            clubs: [...state.clubs, club],
            stats: state.stats ? {
              ...state.stats,
              totalClubsJoined: state.stats.totalClubsJoined + 1
            } : null
          }), false, 'addClub');
        },

        removeClub: (clubId) => {
          set((state) => ({
            clubs: state.clubs.filter(club => club.clubId !== clubId),
            stats: state.stats ? {
              ...state.stats,
              totalClubsJoined: Math.max(0, state.stats.totalClubsJoined - 1)
            } : null
          }), false, 'removeClub');
        },

        updateClubRole: (clubId, role) => {
          set((state) => ({
            clubs: state.clubs.map(club =>
              club.clubId === clubId ? { ...club, role } : club
            )
          }), false, 'updateClubRole');
        },

        // Points actions
        setPointsHistory: (pointsHistory) => {
          set({ pointsHistory }, false, 'setPointsHistory');
        },

        addPointsEntry: (entry) => {
          set((state) => ({
            pointsHistory: [entry, ...state.pointsHistory],
            profile: state.profile ? {
              ...state.profile,
              totalPoints: state.profile.total_points + (entry.pointsAwarded ?? 0)
            } : null,
            stats: state.stats ? {
              ...state.stats,
              totalPointsEarned: state.stats.totalPointsEarned + (entry.pointsAwarded ?? 0)
            } : null
          }), false, 'addPointsEntry');
        },

        updateTotalPoints: (points) => {
          set((state) => ({
            profile: state.profile ? { ...state.profile, totalPoints: points } : null,
            stats: state.stats ? { ...state.stats, totalPointsEarned: points } : null
          }), false, 'updateTotalPoints');
        },

        // Badge actions
        setBadges: (badges) => {
          set({ badges }, false, 'setBadges');
        },

        addBadge: (badge) => {
          set((state) => ({
            badges: [...state.badges, badge],
            stats: state.stats ? {
              ...state.stats,
              totalBadgesEarned: state.stats.totalBadgesEarned + 1
            } : null
          }), false, 'addBadge');
        },

        // Volunteer activity actions
        setVolunteerActivities: (volunteerActivities) => {
          set({ volunteerActivities }, false, 'setVolunteerActivities');
        },

        addVolunteerActivity: (activity) => {
          set((state) => ({
            volunteerActivities: [activity, ...state.volunteerActivities],
            profile: state.profile ? {
              ...state.profile,
              totalVolunteerHours: state.profile.total_volunteer_hours + activity.hoursAwarded
            } : null,
            stats: state.stats ? {
              ...state.stats,
              totalVolunteerHours: state.stats.totalVolunteerHours + activity.hoursAwarded
            } : null
          }), false, 'addVolunteerActivity');
        },

        updateTotalVolunteerHours: (hours) => {
          set((state) => ({
            profile: state.profile ? { ...state.profile, totalVolunteerHours: hours } : null,
            stats: state.stats ? { ...state.stats, totalVolunteerHours: hours } : null
          }), false, 'updateTotalVolunteerHours');
        },

        // Stats actions
        setStats: (stats) => {
          set({ stats }, false, 'setStats');
        },

        updateStats: (updates) => {
          set((state) => ({
            stats: state.stats ? { ...state.stats, ...updates } : null
          }), false, 'updateStats');
        },

        // Loading state actions
        setLoading: (loading) => {
          set({ loading }, false, 'setLoading');
        },

        setClubsLoading: (clubsLoading) => {
          set({ clubsLoading }, false, 'setClubsLoading');
        },

        setPointsLoading: (pointsLoading) => {
          set({ pointsLoading }, false, 'setPointsLoading');
        },

        setBadgesLoading: (badgesLoading) => {
          set({ badgesLoading }, false, 'setBadgesLoading');
        },

        setActivitiesLoading: (activitiesLoading) => {
          set({ activitiesLoading }, false, 'setActivitiesLoading');
        },

        // Error handling actions
        setError: (error) => {
          set({ error }, false, 'setError');
        },

        setClubsError: (clubsError) => {
          set({ clubsError }, false, 'setClubsError');
        },

        setPointsError: (pointsError) => {
          set({ pointsError }, false, 'setPointsError');
        },

        setBadgesError: (badgesError) => {
          set({ badgesError }, false, 'setBadgesError');
        },

        setActivitiesError: (activitiesError) => {
          set({ activitiesError }, false, 'setActivitiesError');
        },

        clearErrors: () => {
          set({
            error: null,
            clubsError: null,
            pointsError: null,
            badgesError: null,
            activitiesError: null
          }, false, 'clearErrors');
        },

        // Utility actions
        clearProfile: () => {
          set({
            profile: null,
            clubs: [],
            pointsHistory: [],
            badges: [],
            volunteerActivities: [],
            stats: null,
            loading: false,
            clubsLoading: false,
            pointsLoading: false,
            badgesLoading: false,
            activitiesLoading: false,
            error: null,
            clubsError: null,
            pointsError: null,
            badgesError: null,
            activitiesError: null
          }, false, 'clearProfile');
        },

        refreshProfile: () => {
          // This method should be implemented in conjunction with the profile service
          // to reload all profile data from the server
          set({ loading: true }, false, 'refreshProfile');
        }
      }),
      {
        name: 'profile-storage',
        partialize: (state) => ({
          profile: state.profile,
          clubs: state.clubs,
          badges: state.badges,
          stats: state.stats
        })
      }
    ),
    {
      name: 'profile-store'
    }
  )
);