// client/src/components/events/CreateEventForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Calendar, MapPin, Users, Award, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  eventType: z.enum(['workshop', 'seminar', 'competition', 'cultural', 'sports', 'technical', 'social']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(3, 'Location is required'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant'),
  pointsReward: z.number().min(0, 'Points cannot be negative'),
  volunteerHours: z.number().min(0, 'Hours cannot be negative'),
  tags: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export const CreateEventForm: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      // TODO: Implement actual API call
      console.log('Form data:', data);
      console.log('Image file:', imageFile);
      
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6" data-testid="create-event-form">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          {/* Event Title */}
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter event title"
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your event"
              rows={4}
              className="w-full"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <select
              id="eventType"
              {...register('eventType')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select event type</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="competition">Competition</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="technical">Technical</option>
              <option value="social">Social</option>
            </select>
            {errors.eventType && (
              <p className="text-sm text-red-600 mt-1">{errors.eventType.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className="w-full pl-10"
                  data-testid="start-date"
                />
              </div>
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date & Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className="w-full pl-10"
                />
              </div>
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                {...register('location')}
                placeholder="Event venue"
                className="w-full pl-10"
              />
            </div>
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Max Participants */}
          <div>
            <Label htmlFor="maxParticipants">Maximum Participants</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="maxParticipants"
                type="number"
                {...register('maxParticipants', { valueAsNumber: true })}
                placeholder="50"
                className="w-full pl-10"
              />
            </div>
            {errors.maxParticipants && (
              <p className="text-sm text-red-600 mt-1">{errors.maxParticipants.message}</p>
            )}
          </div>

          {/* Points and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pointsReward">AICTE Points Reward</Label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="pointsReward"
                  type="number"
                  {...register('pointsReward', { valueAsNumber: true })}
                  placeholder="10"
                  className="w-full pl-10"
                />
              </div>
              {errors.pointsReward && (
                <p className="text-sm text-red-600 mt-1">{errors.pointsReward.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="volunteerHours">Volunteer Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="volunteerHours"
                  type="number"
                  step="0.5"
                  {...register('volunteerHours', { valueAsNumber: true })}
                  placeholder="2.0"
                  className="w-full pl-10"
                />
              </div>
              {errors.volunteerHours && (
                <p className="text-sm text-red-600 mt-1">{errors.volunteerHours.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="technology, workshop, beginner-friendly"
              className="w-full"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Event Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative" data-testid="image-preview">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  data-testid="image-upload"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload event image</span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};