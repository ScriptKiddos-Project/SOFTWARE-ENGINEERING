export interface Event {
	id: string;
	title: string;
	description?: string;
	clubId?: string;
	eventType?: string;
	startDate: string;
	endDate: string;
	location?: string;
	maxParticipants?: number;
	registrationDeadline?: string;
	pointsReward?: number;
	volunteerHours?: number;
	imageUrl?: string;
	tags?: string[];
	skillAreas?: string[];
	isPublished?: boolean;
	requiresApproval?: boolean;
	createdBy?: string;
	createdAt?: string;
	updatedAt?: string;
	registrationCount?: number;

	// snake_case compatibility aliases
	start_date?: string;
	event_type?: string;
	registration_count?: number;
}

export interface EventFilters {
	search?: string;
	clubId?: string;
	category?: string;
	eventType?: string;
	startDate?: string;
	endDate?: string;
	tags?: string[];
	skillAreas?: string[];
	limit?: number;
	offset?: number;
}

export interface EventRegistration {
	id: string;
	userId: string;
	eventId: string;
	registrationDate?: string;
	status?: string;
	attended?: boolean;
	pointsAwarded?: number;
}

export interface CreateEventData {
	title: string;
	description?: string;
	clubId?: string;
	eventType?: string;
	startDate: string;
	endDate: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface AttendanceData {
	userId: string;
	attended: boolean;
	method?: string;
}

export interface EventAnalytics {
	totalRegistrations: number;
	attendanceRate: number;
	averageRating?: number;
}

export interface CalendarEvent {
	id: string;
	title: string;
	start: string;
	end?: string;
	allDay?: boolean;
}
