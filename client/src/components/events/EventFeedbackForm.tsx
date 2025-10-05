// client/src/components/events/EventFeedbackForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please provide a rating').max(5),
  organizationRating: z.number().min(1).max(5),
  contentRating: z.number().min(1).max(5),
  venueRating: z.number().min(1).max(5),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
  suggestions: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface EventFeedbackFormProps {
  eventId: string;
  onClose?: () => void;
}

export const EventFeedbackForm: React.FC<EventFeedbackFormProps> = ({ eventId, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    overall: 0,
    organization: 0,
    content: 0,
    venue: 0,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
    const fieldMap = {
      overall: 'rating',
      organization: 'organizationRating',
      content: 'contentRating',
      venue: 'venueRating',
    };
    setValue(fieldMap[category] as any, value);
  };

  const renderStars = (category: keyof typeof ratings) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleRatingClick(category, value)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                value <= ratings[category]
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call
      console.log('Feedback submitted:', data);
      toast.success('Thank you for your feedback!');
      onClose?.();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Feedback</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <Label>Overall Experience</Label>
            <div className="mt-2">{renderStars('overall')}</div>
            {errors.rating && (
              <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Organization Rating */}
          <div>
            <Label>Event Organization</Label>
            <div className="mt-2">{renderStars('organization')}</div>
            {errors.organizationRating && (
              <p className="text-sm text-red-600 mt-1">{errors.organizationRating.message}</p>
            )}
          </div>

          {/* Content Rating */}
          <div>
            <Label>Content Quality</Label>
            <div className="mt-2">{renderStars('content')}</div>
            {errors.contentRating && (
              <p className="text-sm text-red-600 mt-1">{errors.contentRating.message}</p>
            )}
          </div>

          {/* Venue Rating */}
          <div>
            <Label>Venue & Facilities</Label>
            <div className="mt-2">{renderStars('venue')}</div>
            {errors.venueRating && (
              <p className="text-sm text-red-600 mt-1">{errors.venueRating.message}</p>
            )}
          </div>

          {/* Feedback Text */}
          <div>
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              {...register('feedback')}
              placeholder="Share your experience..."
              rows={4}
              className="w-full mt-2"
            />
            {errors.feedback && (
              <p className="text-sm text-red-600 mt-1">{errors.feedback.message}</p>
            )}
          </div>

          {/* Suggestions */}
          <div>
            <Label htmlFor="suggestions">Suggestions for Improvement</Label>
            <Textarea
              id="suggestions"
              {...register('suggestions')}
              placeholder="How can we make future events better?"
              rows={3}
              className="w-full mt-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};