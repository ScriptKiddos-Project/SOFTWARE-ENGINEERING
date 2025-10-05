// client/src/components/events/EventRegistration.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const registrationSchema = z.object({
  dietaryRestrictions: z.string().optional(),
  specialRequirements: z.string().optional(),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),
  emergencyName: z.string().min(2, 'Emergency contact name is required'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({
  eventId,
  eventTitle,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call
      console.log('Registration data:', { eventId, ...data });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setRegistrationSuccess(true);
      toast.success('Successfully registered for the event!');
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      toast.error('Failed to register for the event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            You have successfully registered for <strong>{eventTitle}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A confirmation email has been sent to your registered email address.
          </p>
          <Button onClick={onSuccess} className="w-full">
            View My Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Event Registration
        </h2>
        <p className="text-gray-600 mb-6">{eventTitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Emergency Contact Name */}
          <div>
            <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
            <Input
              id="emergencyName"
              {...register('emergencyName')}
              placeholder="Full name"
              className="w-full"
            />
            {errors.emergencyName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyName.message}
              </p>
            )}
          </div>

          {/* Emergency Contact Number */}
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
            <Input
              id="emergencyContact"
              {...register('emergencyContact')}
              placeholder="+91 XXXXXXXXXX"
              className="w-full"
            />
            {errors.emergencyContact && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContact.message}
              </p>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div>
            <Label htmlFor="dietaryRestrictions">
              Dietary Restrictions (Optional)
            </Label>
            <Input
              id="dietaryRestrictions"
              {...register('dietaryRestrictions')}
              placeholder="e.g., Vegetarian, Vegan, Allergies"
              className="w-full"
            />
          </div>

          {/* Special Requirements */}
          <div>
            <Label htmlFor="specialRequirements">
              Special Requirements (Optional)
            </Label>
            <Textarea
              id="specialRequirements"
              {...register('specialRequirements')}
              placeholder="Any accessibility needs or other requirements"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              {...register('agreeToTerms')}
              className="mt-1 rounded"
            />
            <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
              I agree to the terms and conditions and understand that attendance
              is mandatory to receive AICTE points and volunteer hours.
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
          )}

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Points and volunteer hours will only be awarded upon attendance
              confirmation by the event organizer.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};