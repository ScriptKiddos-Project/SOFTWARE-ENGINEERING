// client/src/store/clubStore.ts
import { create } from 'zustand';
import { Club, ClubMember, ClubFilters } from '../types';
import { clubService } from '../services/clubService';

interface ClubStore {
  // State
  clubs: Club[];
  selectedClub: Club | null;
  clubMembers: ClubMember[];
  isLoading: boolean;
  error: string | null;
  filters: Partial<ClubFilters>;
  totalClubs: number;

  // Actions
  fetchClubs: (filters?: Partial<ClubFilters>) => Promise<void>;
  fetchClubById: (id: string) => Promise<void>;
  createClub: (clubData: any) => Promise<Club>;
  updateClub: (id: string, clubData: Partial<Club>) => Promise<Club>;
  deleteClub: (id: string) => Promise<void>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  fetchClubMembers: (clubId: string) => Promise<void>;

  setFilters: (filters: Partial<ClubFilters>) => void;
  setSelectedClub: (club: Club | null) => void;
  clearError: () => void;
  resetStore: () => void;
}

const initialState: Omit<ClubStore, 'fetchClubs' | 'fetchClubById' | 'createClub' | 'updateClub' | 'deleteClub' | 'joinClub' | 'leaveClub' | 'fetchClubMembers' | 'setFilters' | 'setSelectedClub' | 'clearError' | 'resetStore'> = {
  clubs: [],
  selectedClub: null,
  clubMembers: [],
  isLoading: false,
  error: null,
  filters: {},
  totalClubs: 0,
};

export const useClubStore = create<ClubStore>((set, get) => ({
  ...initialState,

  // fetchClubs: async (filters) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const current = { ...(get().filters || {}), ...(filters || {}) } as ClubFilters;
  //     const res = await clubService.getClubs(current);
  //     const data = res.data;
  //     set({ clubs: data?.clubs || [], totalClubs: data?.total || 0, isLoading: false, filters: current });
  //   } catch (err: any) {
  //     set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to fetch clubs' });
  //   }
  // },

  fetchClubs: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const current = { ...(get().filters || {}), ...(filters || {}) } as ClubFilters;
      const data = await clubService.getClubs(current); // ✅ returns ClubListResponse

      set({
        clubs: data.clubs,
        totalClubs: data.total,
        isLoading: false,
        filters: current,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to fetch clubs',
      });
    }
  },

  fetchClubById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await clubService.getClubById(id);
      const data = (res as any).data || res;
      set({ selectedClub: data || null, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to fetch club' });
    }
  },

  createClub: async (clubData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await clubService.createClub(clubData);
      const data = (res as any).data || res;
      set((state) => ({ clubs: [data, ...state.clubs], isLoading: false }));
      return data as Club;
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to create club' });
      throw err;
    }
  },

  updateClub: async (id, clubData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await clubService.updateClub(id, clubData);
      const data = (res as any).data || res;
      set((state) => ({ clubs: state.clubs.map((c) => (c.id === id ? data : c)), selectedClub: state.selectedClub?.id === id ? data : state.selectedClub, isLoading: false }));
      return data as Club;
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to update club' });
      throw err;
    }
  },

  deleteClub: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await clubService.deleteClub(id);
      set((state) => ({ clubs: state.clubs.filter((c) => c.id !== id), selectedClub: state.selectedClub?.id === id ? null : state.selectedClub, isLoading: false }));
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to delete club' });
      throw err;
    }
  },

  joinClub: async (clubId) => {
    set({ isLoading: true, error: null });
    try {
      await clubService.joinClub(clubId);
      set((state) => ({ clubs: state.clubs.map((club) => (club.id === clubId ? { ...club, isJoined: true, memberCount: (club.memberCount || 0) + 1 } : club)), selectedClub: state.selectedClub?.id === clubId ? { ...state.selectedClub, isJoined: true, memberCount: (state.selectedClub.memberCount || 0) + 1 } : state.selectedClub, isLoading: false }));
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to join club' });
      throw err;
    }
  },

  leaveClub: async (clubId) => {
    set({ isLoading: true, error: null });
    try {
      await clubService.leaveClub(clubId);
      set((state) => ({ clubs: state.clubs.map((club) => (club.id === clubId ? { ...club, isJoined: false, memberCount: Math.max(0, (club.memberCount || 0) - 1) } : club)), selectedClub: state.selectedClub?.id === clubId ? { ...state.selectedClub, isJoined: false, memberCount: Math.max(0, (state.selectedClub.memberCount || 0) - 1) } : state.selectedClub, isLoading: false }));
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to leave club' });
      throw err;
    }
  },

  fetchClubMembers: async (clubId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await clubService.getClubMembers(clubId);
      const data = (res as any).data || res;
      set({ clubMembers: data || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message || err?.message || 'Failed to fetch members' });
    }
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedClub: (club) => set({ selectedClub: club }),
  clearError: () => set({ error: null }),
  resetStore: () => set(initialState as any),
}));