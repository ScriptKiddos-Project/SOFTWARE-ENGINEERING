-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('student', 'club_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "ClubCategory" AS ENUM ('technical', 'cultural', 'sports', 'academic', 'social_service', 'entrepreneurship', 'arts', 'other');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('workshop', 'seminar', 'competition', 'cultural_event', 'sports_event', 'volunteering', 'hackathon', 'conference', 'social_gathering', 'other');

-- CreateEnum
CREATE TYPE "ClubMemberRole" AS ENUM ('member', 'core_member', 'secretary', 'treasurer', 'vice_president', 'president');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('registered', 'waitlisted', 'cancelled', 'attended', 'no_show');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('manual', 'qr_code', 'geofence', 'biometric');

-- CreateEnum
CREATE TYPE "AttendanceAction" AS ENUM ('marked_present', 'marked_absent', 'unmarked', 'updated_status');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "student_id" TEXT,
    "phone" TEXT,
    "department" TEXT,
    "year_of_study" INTEGER,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "suspended_until" TIMESTAMP(3),
    "profile_image" TEXT,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "total_volunteer_hours" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ClubCategory" NOT NULL,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "contact_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "club_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "max_participants" INTEGER,
    "registration_deadline" TIMESTAMP(3),
    "points_reward" INTEGER NOT NULL DEFAULT 0,
    "volunteer_hours" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "image_url" TEXT,
    "tags" TEXT[],
    "skill_areas" TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_clubs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "role" "ClubMemberRole" NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'registered',
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendance_marked_by" TEXT,
    "attendance_marked_at" TIMESTAMP(3),
    "attendance_method" "AttendanceMethod",
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "volunteer_hours_awarded" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "feedback_submitted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "marked_by" TEXT NOT NULL,
    "action" "AttendanceAction" NOT NULL,
    "previous_status" BOOLEAN,
    "new_status" BOOLEAN,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_qr_codes" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "qr_code_data" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "max_scans" INTEGER,
    "current_scans" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT,
    "points_earned" INTEGER NOT NULL,
    "volunteer_hours_earned" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" TEXT,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_moderations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" INTEGER,
    "moderated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_moderations" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "moderated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_moderations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "moderated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_moderations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "tasks" TEXT[],
    "results" TEXT[],
    "performed_by" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_student_id_key" ON "users"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_clubs_user_id_club_id_key" ON "user_clubs"("user_id", "club_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_user_id_event_id_key" ON "event_registrations"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_feedback_user_id_event_id_key" ON "event_feedback"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_clubs" ADD CONSTRAINT "user_clubs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_clubs" ADD CONSTRAINT "user_clubs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_attendance_marked_by_fkey" FOREIGN KEY ("attendance_marked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_marked_by_fkey" FOREIGN KEY ("marked_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_qr_codes" ADD CONSTRAINT "event_qr_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_qr_codes" ADD CONSTRAINT "event_qr_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback" ADD CONSTRAINT "event_feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
