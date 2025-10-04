export interface UserClub {
	id: string;
	userId: string;
	clubId: string;
	role: string;
	joinedAt: Date;
	isActive: boolean;
}
import type { ID, ClubCategory, Email, URL, Timestamp } from './index';

export interface Club {
	id: ID;
	name: string;
	description?: string;
	category: ClubCategory;
	logoUrl?: URL;
	coverImageUrl?: URL;
	contactEmail?: Email;
	isActive: boolean;
	memberCount: number;
	createdBy: ID;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
// also accept snake_case aliases directly on Club for compatibility
export interface Club extends Record<string, any> {
	logo_url?: string;
	cover_image_url?: string;
	contact_email?: string;
	is_active?: boolean;
	member_count?: number;
	created_at?: string;
	updated_at?: string;
}

// Data shapes for create/update operations
export interface CreateClubData {
	name: string;
	description?: string;
	category: ClubCategory;
	contactEmail?: Email;
	logoFile?: File;
	coverImageFile?: File;
}

export type UpdateClubData = Partial<CreateClubData>;

// Compatibility: map snake_case API responses to camelCase types (lightweight)
export type ClubApi = Omit<Club, 'logoUrl' | 'coverImageUrl' | 'contactEmail' | 'isActive' | 'memberCount' | 'createdAt' | 'updatedAt'> & {
	logo_url?: string;
	cover_image_url?: string;
	contact_email?: string;
	is_active?: boolean;
	member_count?: number;
	created_at?: string;
	updated_at?: string;
};

export type ClubMember = {
	id: ID;
	user_id: ID;
	club_id: ID;
	user: import('./user').User;
	role: string;
	joined_at: Timestamp;
	is_active: boolean;
};

export type ClubFilters = {
	search?: string;
	category?: ClubCategory[];
	isActive?: boolean;
	page?: number;
	limit?: number;
};
