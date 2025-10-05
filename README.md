# SOFTWARE-ENGINEERING
CLUBHUB 

```
clubhub
├─ client
│  ├─ components.json
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.cjs
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ clubs
│  │  │  │  ├─ ClubCard.tsx
│  │  │  │  ├─ ClubManagement.tsx
│  │  │  │  ├─ ClubMembers.tsx
│  │  │  │  ├─ ClubProfile.tsx
│  │  │  │  └─ JoinClubModal.tsx
│  │  │  ├─ common
│  │  │  │  ├─ ConfirmDialog.tsx
│  │  │  │  ├─ ErrorBoundary.tsx
│  │  │  │  ├─ hooks
│  │  │  │  │  └─ useDebounce.ts
│  │  │  │  ├─ LoadingSpinner.tsx
│  │  │  │  ├─ NotificationBell.tsx
│  │  │  │  └─ SearchBar.tsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ ClubCategories.tsx
│  │  │  │  ├─ QuickActions.tsx
│  │  │  │  ├─ RecentActivity.tsx
│  │  │  │  ├─ StatsCards.tsx
│  │  │  │  └─ TopEvents.tsx
│  │  │  ├─ events
│  │  │  │  ├─ CreateEventForm.tsx
│  │  │  │  ├─ EventCalendar.tsx
│  │  │  │  ├─ EventCard.tsx
│  │  │  │  ├─ EventFeedbackForm.tsx
│  │  │  │  ├─ EventFilters.tsx
│  │  │  │  ├─ EventModal.tsx
│  │  │  │  ├─ EventRegistration.tsx
│  │  │  │  └─ EventTimeline.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Footer.tsx
│  │  │  │  ├─ Header.tsx
│  │  │  │  ├─ Layout.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  ├─ profile
│  │  │  │  ├─ BadgeDisplay.tsx
│  │  │  │  ├─ JoinedClubs.tsx
│  │  │  │  ├─ PointsHistory.tsx
│  │  │  │  ├─ ProfileHeader.tsx
│  │  │  │  ├─ ProfileSettings.tsx
│  │  │  │  └─ VolunteerHours.tsx
│  │  │  └─ ui
│  │  │     ├─ alert.tsx
│  │  │     ├─ avatar.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ calendar.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ dropdown-menu.tsx
│  │  │     ├─ form.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ popover.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ tabs.tsx
│  │  │     ├─ textarea.tsx
│  │  │     └─ toast.tsx
│  │  ├─ hooks
│  │  │  ├─ useAuth.ts
│  │  │  ├─ useClubs.ts
│  │  │  ├─ useDebounce.ts
│  │  │  ├─ useEvents.ts
│  │  │  ├─ useLocalStorage.ts
│  │  │  ├─ useNotifications.ts
│  │  │  └─ useProfile.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ AdminPanel.tsx
│  │  │  ├─ ClubDetail.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ EventDetail.tsx
│  │  │  ├─ Events.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Profile.tsx
│  │  │  └─ Register.tsx
│  │  ├─ services
│  │  │  ├─ api.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ clubService.ts
│  │  │  ├─ eventService.ts
│  │  │  ├─ profileService.ts
│  │  │  └─ uploadService.ts
│  │  ├─ store
│  │  │  ├─ authStore.ts
│  │  │  ├─ clubStore.ts
│  │  │  ├─ eventStore.ts
│  │  │  ├─ index.ts
│  │  │  ├─ notificationStore.ts
│  │  │  └─ profileStore.ts
│  │  ├─ styles
│  │  │  └─ globals.pcss
│  │  ├─ types
│  │  │  ├─ api.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ club.ts
│  │  │  ├─ event.ts
│  │  │  ├─ index.ts
│  │  │  └─ user.ts
│  │  ├─ utils
│  │  │  ├─ constants.ts
│  │  │  ├─ dateUtils.ts
│  │  │  ├─ formatters.ts
│  │  │  ├─ helpers.ts
│  │  │  ├─ index.ts
│  │  │  └─ validators.ts
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.json
│  └─ vite.config.ts
├─ README.md
└─ server
   ├─ nodemon.json
   ├─ package-lock.json
   ├─ package.json
   ├─ prisma
   │  └─ schema.prisma
   ├─ src
   │  ├─ app.ts
   │  ├─ config
   │  │  ├─ cloudinary.ts
   │  │  ├─ database.ts
   │  │  └─ email.ts
   │  ├─ controller
   │  │  ├─ adminController.ts
   │  │  ├─ attendanceController.ts
   │  │  ├─ authController.ts
   │  │  ├─ clubController.ts
   │  │  ├─ eventController.ts
   │  │  ├─ profileController.ts
   │  │  └─ userController.ts
   │  ├─ middleware
   │  │  ├─ auth.ts
   │  │  ├─ errorHandler.ts
   │  │  ├─ rateLimiter.ts
   │  │  ├─ upload.ts
   │  │  └─ validation.ts
   │  ├─ routes
   │  │  ├─ admin.ts
   │  │  ├─ auth.ts
   │  │  ├─ clubs.ts
   │  │  ├─ events.ts
   │  │  ├─ profile.ts
   │  │  └─ users.ts
   │  ├─ server.ts
   │  ├─ services
   │  │  ├─ adminService.ts
   │  │  ├─ attendanceService.ts
   │  │  ├─ authService.ts
   │  │  ├─ badgeService.ts
   │  │  ├─ clubService.ts
   │  │  ├─ emailService.ts
   │  │  ├─ eventService.ts
   │  │  ├─ pointsService.ts
   │  │  ├─ profileService.ts
   │  │  └─ userService.ts
   │  ├─ test-db.ts
   │  ├─ types
   │  │  ├─ auth.ts
   │  │  ├─ authRequest.ts
   │  │  ├─ club.ts
   │  │  ├─ events.ts
   │  │  ├─ express.d.ts
   │  │  ├─ index.ts
   │  │  └─ user.ts
   │  └─ utils
   │     ├─ bcrypt.ts
   │     ├─ constants.ts
   │     ├─ errors.ts
   │     ├─ jwt.ts
   │     ├─ logger.ts
   │     ├─ qrCodeGenerator.ts
   │     └─ validation.ts
   └─ tsconfig.json

```