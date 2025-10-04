// Utility functions for formatting data, dates, text, numbers, etc.

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: Date | string, pattern: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
};

export const formatTime = (date: Date | string, pattern: string = 'h:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
};

export const formatDateTime = (date: Date | string, pattern: string = 'MMM dd, yyyy h:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${formatTime(dateObj)}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatEventDate = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const startFormatted = formatDateTime(start, 'MMM dd, yyyy h:mm a');
  
  // If same day, only show time for end
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return `${startFormatted} - ${formatTime(end)}`;
  }
  
  // Different days
  return `${startFormatted} - ${formatDateTime(end, 'MMM dd, yyyy h:mm a')}`;
};

export const formatDuration = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) {
    return `${diffMinutes}m`;
  }
  
  if (diffMinutes === 0) {
    return `${diffHours}h`;
  }
  
  return `${diffHours}h ${diffMinutes}m`;
};

// Number formatting utilities
export const formatNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCompactNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num);
};

export const formatPercentage = (value: number, total: number, decimals: number = 1): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return formatNumber(points);
};

export const formatVolunteerHours = (hours: number): string => {
  if (hours === 0) return '0 hours';
  if (hours === 1) return '1 hour';
  if (hours < 10) return `${hours.toFixed(1)} hours`;
  return `${Math.round(hours)} hours`;
};

// Text formatting utilities
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const formatInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

export const formatStudentId = (studentId: string): string => {
  // Format student ID with consistent pattern (e.g., 2021-CS-001)
  if (!studentId) return '';
  
  // Remove any existing formatting
  const cleaned = studentId.replace(/[^a-zA-Z0-9]/g, '');
  
  // Apply standard format if it matches expected pattern
  if (cleaned.length >= 7) {
    const year = cleaned.substring(0, 4);
    const dept = cleaned.substring(4, 6).toUpperCase();
    const num = cleaned.substring(6);
    return `${year}-${dept}-${num.padStart(3, '0')}`;
  }
  
  return studentId; // Return original if doesn't match expected pattern
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for 10-digit numbers
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX for 11-digit numbers (with country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }
  
  return phone; // Return original if doesn't match expected patterns
};

export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Status and badge formatting
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => capitalizeFirstLetter(word))
    .join(' ');
};

export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'student': 'Student',
    'club_admin': 'Club Admin',
    'super_admin': 'Super Admin',
    'member': 'Member',
    'coordinator': 'Coordinator',
    'secretary': 'Secretary',
    'treasurer': 'Treasurer',
    'president': 'President',
    'admin': 'Admin'
  };
  
  return roleMap[role] || formatStatus(role);
};

export const formatEventType = (eventType: string): string => {
  const typeMap: Record<string, string> = {
    'workshop': 'Workshop',
    'seminar': 'Seminar',
    'competition': 'Competition',
    'social': 'Social Event',
    'volunteer': 'Volunteer Work',
    'cultural': 'Cultural Event',
    'sports': 'Sports Event',
    'technical': 'Technical Event',
    'career': 'Career Event',
    'other': 'Other'
  };
  
  return typeMap[eventType] || formatStatus(eventType);
};

export const formatClubCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'technical': 'Technical',
    'cultural': 'Cultural',
    'sports': 'Sports',
    'academic': 'Academic',
    'social_service': 'Social Service',
    'entrepreneurship': 'Entrepreneurship',
    'arts': 'Arts',
    'music': 'Music',
    'dance': 'Dance',
    'drama': 'Drama',
    'photography': 'Photography',
    'writing': 'Writing',
    'debate': 'Debate',
    'environment': 'Environment',
    'health': 'Health',
    'finance': 'Finance',
    'other': 'Other'
  };
  
  return categoryMap[category] || formatStatus(category);
};

export const formatSkillArea = (skillArea: string): string => {
  const skillMap: Record<string, string> = {
    'technical': 'Technical Skills',
    'leadership': 'Leadership',
    'communication': 'Communication',
    'creativity': 'Creativity',
    'problem_solving': 'Problem Solving',
    'teamwork': 'Teamwork',
    'project_management': 'Project Management',
    'research': 'Research',
    'entrepreneurship': 'Entrepreneurship',
    'social_service': 'Social Service'
  };
  
  return skillMap[skillArea] || formatStatus(skillArea);
};

// List formatting utilities
export const formatList = (items: string[], conjunction: string = 'and'): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
};

export const formatTags = (tags: string[]): string => {
  return tags.map(tag => `#${tag}`).join(' ');
};

// URL formatting utilities
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Add https:// if no protocol specified
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  
  return url;
};

export const formatSocialUrl = (platform: string, username: string): string => {
  const platformUrls: Record<string, string> = {
    'linkedin': 'https://linkedin.com/in/',
    'twitter': 'https://twitter.com/',
    'instagram': 'https://instagram.com/',
    'github': 'https://github.com/',
    'facebook': 'https://facebook.com/'
  };
  
  const baseUrl = platformUrls[platform.toLowerCase()];
  if (!baseUrl) return username;
  
  // Remove @ symbol if present
  const cleanUsername = username.replace('@', '');
  return `${baseUrl}${cleanUsername}`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return `${bytes} ${sizes[i]}`;
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Color utilities
export const formatHexColor = (color: string): string => {
  if (!color) return '';
  
  // Remove # if present
  const cleaned = color.replace('#', '');
  
  // Ensure 6 characters
  if (cleaned.length === 3) {
    return `#${cleaned.split('').map(c => c + c).join('')}`;
  }
  
  if (cleaned.length === 6) {
    return `#${cleaned}`;
  }
  
  return color; // Return original if invalid
};

// Search result highlighting
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Price/currency formatting (for future paid events)
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Grade/GPA formatting
export const formatGPA = (gpa: number): string => {
  return gpa.toFixed(2);
};

export const formatGrade = (percentage: number): string => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Academic year formatting
export const formatAcademicYear = (year: number | string): string => {
  const yearMap: Record<string, string> = {
    '1': 'Freshman',
    '2': 'Sophomore',
    '3': 'Junior',
    '4': 'Senior',
    'graduate': 'Graduate',
    'phd': 'PhD'
  };
  
  return yearMap[year.toString()] || year.toString();
};

// Streak formatting
export const formatStreak = (days: number): string => {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} day streak`;
};

// Rating formatting
export const formatRating = (rating: number, maxRating: number = 5): string => {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxRating - Math.floor(rating));
  return `${stars} (${rating.toFixed(1)})`;
};

// Address formatting
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

// Export utility for easy importing
export const formatters = {
  // Date formatters
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatEventDate,
  formatDuration,
  
  // Number formatters
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatPoints,
  formatVolunteerHours,
  
  // Text formatters
  truncateText,
  capitalizeFirstLetter,
  capitalizeWords,
  formatName,
  formatInitials,
  formatStudentId,
  formatPhoneNumber,
  formatEmail,
  
  // Status formatters
  formatStatus,
  formatRole,
  formatEventType,
  formatClubCategory,
  formatSkillArea,
  
  // List formatters
  formatList,
  formatTags,
  
  // URL formatters
  formatUrl,
  formatSocialUrl,
  
  // Misc formatters
  formatFileSize,
  formatHexColor,
  highlightSearchTerm,
  formatCurrency,
  formatGPA,
  formatGrade,
  formatAcademicYear,
  formatStreak,
  formatRating,
  formatAddress
};