// client/src/components/profile/ProfileSettings.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Building, GraduationCap, Lock, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  studentId: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
  yearOfStudy: z.number().min(1).max(5),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileSettingsProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    studentId?: string;
    department?: string;
    yearOfStudy?: number;
  };
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true);
      // TODO: Replace with actual API call
      console.log('Profile update:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsUpdating(true);
      // TODO: Replace with actual API call
      console.log('Password update');
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      {...registerProfile('firstName')}
                      className="pl-10"
                      placeholder="John"
                    />
                  </div>
                  {profileErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      {...registerProfile('lastName')}
                      className="pl-10"
                      placeholder="Doe"
                    />
                  </div>
                  {profileErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile('email')}
                      className="pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      {...registerProfile('phone')}
                      className="pl-10"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                {/* Student ID */}
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    {...registerProfile('studentId')}
                    placeholder="STU12345"
                  />
                </div>

                {/* Department */}
                <div>
                  <Label htmlFor="department">Department</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="department"
                      {...registerProfile('department')}
                      className="pl-10"
                      placeholder="Computer Science"
                    />
                  </div>
                  {profileErrors.department && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.department.message}
                    </p>
                  )}
                </div>

                {/* Year of Study */}
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <div className="relative mt-1">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      id="yearOfStudy"
                      {...registerProfile('yearOfStudy', { valueAsNumber: true })}
                      className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select year</option>
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year</option>
                    </select>
                  </div>
                  {profileErrors.yearOfStudy && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.yearOfStudy.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
              {/* Current Password */}
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword('currentPassword')}
                    className="pl-10"
                    placeholder="Enter current password"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword('newPassword')}
                    className="pl-10"
                    placeholder="Enter new password"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className="pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Make sure your new password is at least 8 characters long and contains a mix of letters, numbers, and special characters.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};