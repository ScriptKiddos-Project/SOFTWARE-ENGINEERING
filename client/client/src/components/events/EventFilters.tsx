// client/src/components/events/EventFilters.tsx
import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useEvents } from '../../hooks/useEvents';
import type { EventFilters as EventFiltersType } from '../../types/index';
import { format } from 'date-fns';

const EVENT_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'volunteer', label: 'Volunteer' },
];

const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'competition', label: 'Competition' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'conference', label: 'Conference' },
  { value: 'social', label: 'Social Event' },
];

// Use enum keys for skill areas and event types
import { SKILL_AREAS, EVENT_TYPES as EVENT_TYPE_ENUM, CLUB_CATEGORIES } from '../../utils/constants';

const SKILL_AREA_KEYS = Object.keys(SKILL_AREAS) as Array<keyof typeof SKILL_AREAS>;
const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPE_ENUM) as Array<keyof typeof EVENT_TYPE_ENUM>;
const CLUB_CATEGORY_KEYS = Object.keys(CLUB_CATEGORIES) as Array<keyof typeof CLUB_CATEGORIES>;

export const EventFilters: React.FC = () => {
  const [filters, setFilters] = React.useState<EventFiltersType>({});

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };
  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      clubCategory: value === 'all' ? [] : [value as keyof typeof CLUB_CATEGORIES]
    }));
  };
  const handleEventTypeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      eventType: value === 'all' ? [] : [value as keyof typeof EVENT_TYPE_ENUM]
    }));
  };
  const handleDateFromChange = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, start: date ? date.toISOString() : undefined }
    }));
  };
  const handleDateToChange = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, end: date ? date.toISOString() : undefined }
    }));
  };
  const handleSkillAreaToggle = (skillArea: string) => {
    const currentSkillAreas = filters.skillAreas || [];
    const key = skillArea as keyof typeof SKILL_AREAS;
    const updatedSkillAreas = currentSkillAreas.includes(key)
      ? currentSkillAreas.filter(area => area !== key)
      : [...currentSkillAreas, key];
    setFilters(prev => ({ ...prev, skillAreas: updatedSkillAreas }));
  };
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as EventFiltersType['sortBy'],
      sortOrder: sortOrder as 'asc' | 'desc'
    }));
  };
  const clearFilters = () => {
    setFilters({});
  };
  const hasActiveFilters = () => {
    return (
      filters.search ||
      (filters.clubCategory && filters.clubCategory.length > 0) ||
      (filters.eventType && filters.eventType.length > 0) ||
      (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) ||
      (filters.skillAreas && filters.skillAreas.length > 0)
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search events..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category and Event Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Category
          </label>
          <Select
            value={filters.clubCategory && filters.clubCategory.length > 0 ? filters.clubCategory[0] : 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Event Type
          </label>
          <Select
            value={filters.eventType && filters.eventType.length > 0 ? filters.eventType[0] : 'all'}
            onValueChange={handleEventTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EVENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            From Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateRange && filters.dateRange.start ? (
                  format(new Date(filters.dateRange.start), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.dateRange && filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                onSelect={handleDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            To Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateRange && filters.dateRange.end ? (
                  format(new Date(filters.dateRange.end), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.dateRange && filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                onSelect={handleDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Skill Areas */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Skill Areas
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILL_AREA_KEYS.map(skillArea => (
            <Badge
              key={skillArea}
              variant={
                filters.skillAreas?.includes(skillArea) ? 'default' : 'outline'
              }
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleSkillAreaToggle(skillArea)}
            >
              {SKILL_AREAS[skillArea]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Sort By
        </label>
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startDate-asc">Date (Earliest First)</SelectItem>
            <SelectItem value="startDate-desc">Date (Latest First)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="pointsReward-desc">Points (High to Low)</SelectItem>
            <SelectItem value="pointsReward-asc">Points (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary">
                Search: {filters.search}
              </Badge>
            )}
            {filters.clubCategory && filters.clubCategory.length > 0 && (
              <Badge variant="secondary">
                Category: {EVENT_CATEGORIES.find(c => c.value === filters.clubCategory?.[0])?.label}
              </Badge>
            )}
            {filters.eventType && filters.eventType.length > 0 && (
              <Badge variant="secondary">
                Type: {EVENT_TYPES.find(t => t.value === filters.eventType?.[0])?.label}
              </Badge>
            )}
            {filters.dateRange?.start && (
              <Badge variant="secondary">
                From: {format(new Date(filters.dateRange.start), 'MMM d, yyyy')}
              </Badge>
            )}
            {filters.dateRange?.end && (
              <Badge variant="secondary">
                To: {format(new Date(filters.dateRange.end), 'MMM d, yyyy')}
              </Badge>
            )}
            {filters.skillAreas?.map(area => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}