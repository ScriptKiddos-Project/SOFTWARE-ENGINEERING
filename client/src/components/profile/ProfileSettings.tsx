// // client/src/components/profile/ProfileSettings.tsx
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { User, Mail, Phone, Building, GraduationCap, Lock, Save } from 'lucide-react';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { toast } from 'sonner';

// const profileSchema = z.object({
//   firstName: z.string().min(2, 'First name must be at least 2 characters'),
//   lastName: z.string().min(2, 'Last name must be at least 2 characters'),
//   email: z.string().email('Invalid email address'),
//   phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
//   studentId: z.string().optional(),
//   department: z.string().min(2, 'Department is required'),
//   yearOfStudy: z.number().min(1).max(5),
// });

// const passwordSchema = z.object({
//   currentPassword: z.string().min(6, 'Current password is required'),
//   newPassword: z.string().min(8, 'New password must be at least 8 characters'),
//   confirmPassword: z.string().min(8, 'Please confirm your password'),
// }).refine(data => data.newPassword === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// });

// type ProfileFormData = z.infer<typeof profileSchema>;
// type PasswordFormData = z.infer<typeof passwordSchema>;

// interface ProfileSettingsProps {
//   user?: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone?: string;
//     studentId?: string;
//     department?: string;
//     yearOfStudy?: number;
//   };
// }

// export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
//   const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
//   const [isUpdating, setIsUpdating] = useState(false);

//   const {
//     register: registerProfile,
//     handleSubmit: handleProfileSubmit,
//     formState: { errors: profileErrors },
//   } = useForm<ProfileFormData>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: user,
//   });

//   const {
//     register: registerPassword,
//     handleSubmit: handlePasswordSubmit,
//     formState: { errors: passwordErrors },
//     reset: resetPassword,
//   } = useForm<PasswordFormData>({
//     resolver: zodResolver(passwordSchema),
//   });

//   const onProfileSubmit = async (data: ProfileFormData) => {
//     try {
//       setIsUpdating(true);
//       // TODO: Replace with actual API call
//       console.log('Profile update:', data);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Profile updated successfully');
//     } catch (error) {
//       toast.error('Failed to update profile');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const onPasswordSubmit = async (data: PasswordFormData) => {
//     try {
//       setIsUpdating(true);
//       // TODO: Replace with actual API call
//       console.log('Password update');
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Password changed successfully');
//       resetPassword();
//     } catch (error) {
//       toast.error('Failed to change password');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-md">
//         {/* Tabs */}
//         <div className="border-b border-gray-200">
//           <div className="flex">
//             <button
//               onClick={() => setActiveTab('profile')}
//               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'profile'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Profile Information
//             </button>
//             <button
//               onClick={() => setActiveTab('password')}
//               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'password'
//                   ? 'border-blue-600 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               Change Password
//             </button>
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6">
//           {activeTab === 'profile' && (
//             <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* First Name */}
//                 <div>
//                   <Label htmlFor="firstName">First Name</Label>
//                   <div className="relative mt-1">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="firstName"
//                       {...registerProfile('firstName')}
//                       className="pl-10"
//                       placeholder="John"
//                     />
//                   </div>
//                   {profileErrors.firstName && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.firstName.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Last Name */}
//                 <div>
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <div className="relative mt-1">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="lastName"
//                       {...registerProfile('lastName')}
//                       className="pl-10"
//                       placeholder="Doe"
//                     />
//                   </div>
//                   {profileErrors.lastName && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.lastName.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <Label htmlFor="email">Email Address</Label>
//                   <div className="relative mt-1">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="email"
//                       type="email"
//                       {...registerProfile('email')}
//                       className="pl-10"
//                       placeholder="john@example.com"
//                     />
//                   </div>
//                   {profileErrors.email && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Phone */}
//                 <div>
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <div className="relative mt-1">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="phone"
//                       {...registerProfile('phone')}
//                       className="pl-10"
//                       placeholder="+91 XXXXXXXXXX"
//                     />
//                   </div>
//                   {profileErrors.phone && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.phone.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Student ID */}
//                 <div>
//                   <Label htmlFor="studentId">Student ID</Label>
//                   <Input
//                     id="studentId"
//                     {...registerProfile('studentId')}
//                     placeholder="STU12345"
//                   />
//                 </div>

//                 {/* Department */}
//                 <div>
//                   <Label htmlFor="department">Department</Label>
//                   <div className="relative mt-1">
//                     <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="department"
//                       {...registerProfile('department')}
//                       className="pl-10"
//                       placeholder="Computer Science"
//                     />
//                   </div>
//                   {profileErrors.department && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.department.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Year of Study */}
//                 <div>
//                   <Label htmlFor="yearOfStudy">Year of Study</Label>
//                   <div className="relative mt-1">
//                     <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <select
//                       id="yearOfStudy"
//                       {...registerProfile('yearOfStudy', { valueAsNumber: true })}
//                       className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2"
//                     >
//                       <option value="">Select year</option>
//                       <option value={1}>1st Year</option>
//                       <option value={2}>2nd Year</option>
//                       <option value={3}>3rd Year</option>
//                       <option value={4}>4th Year</option>
//                       <option value={5}>5th Year</option>
//                     </select>
//                   </div>
//                   {profileErrors.yearOfStudy && (
//                     <p className="text-sm text-red-600 mt-1">
//                       {profileErrors.yearOfStudy.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button type="submit" disabled={isUpdating}>
//                   <Save className="h-4 w-4 mr-2" />
//                   {isUpdating ? 'Saving...' : 'Save Changes'}
//                 </Button>
//               </div>
//             </form>
//           )}

//           {activeTab === 'password' && (
//             <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
//               {/* Current Password */}
//               <div>
//                 <Label htmlFor="currentPassword">Current Password</Label>
//                 <div className="relative mt-1">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="currentPassword"
//                     type="password"
//                     {...registerPassword('currentPassword')}
//                     className="pl-10"
//                     placeholder="Enter current password"
//                   />
//                 </div>
//                 {passwordErrors.currentPassword && (
//                   <p className="text-sm text-red-600 mt-1">
//                     {passwordErrors.currentPassword.message}
//                   </p>
//                 )}
//               </div>

//               {/* New Password */}
//               <div>
//                 <Label htmlFor="newPassword">New Password</Label>
//                 <div className="relative mt-1">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="newPassword"
//                     type="password"
//                     {...registerPassword('newPassword')}
//                     className="pl-10"
//                     placeholder="Enter new password"
//                   />
//                 </div>
//                 {passwordErrors.newPassword && (
//                   <p className="text-sm text-red-600 mt-1">
//                     {passwordErrors.newPassword.message}
//                   </p>
//                 )}
//               </div>

//               {/* Confirm Password */}
//               <div>
//                 <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                 <div className="relative mt-1">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     {...registerPassword('confirmPassword')}
//                     className="pl-10"
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//                 {passwordErrors.confirmPassword && (
//                   <p className="text-sm text-red-600 mt-1">
//                     {passwordErrors.confirmPassword.message}
//                   </p>
//                 )}
//               </div>

//               <div className="bg-blue-50 border border-yellow-200 rounded-lg p-4">
//                 <p className="text-sm text-yellow-800">
//                   Make sure your new password is at least 8 characters long and contains a mix of letters, numbers, and special characters.
//                 </p>
//               </div>

//               <div className="flex justify-end">
//                 <Button type="submit" disabled={isUpdating}>
//                   <Lock className="h-4 w-4 mr-2" />
//                   {isUpdating ? 'Updating...' : 'Change Password'}
//                 </Button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


// client/src/components/profile/ProfileSettings.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Building, GraduationCap, Lock, Save, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useThemeStore } from '@/store/themeStore';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const { theme, setTheme } = useThemeStore();

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
      <div className="bg-card rounded-lg shadow-md border border-border">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...registerProfile('firstName')}
                    leftIcon={<User className="h-4 w-4" />}
                    placeholder="John"
                    error={profileErrors.firstName?.message}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...registerProfile('lastName')}
                    leftIcon={<User className="h-4 w-4" />}
                    placeholder="Doe"
                    error={profileErrors.lastName?.message}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile('email')}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder="john@example.com"
                    error={profileErrors.email?.message}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...registerProfile('phone')}
                    leftIcon={<Phone className="h-4 w-4" />}
                    placeholder="+91 XXXXXXXXXX"
                    error={profileErrors.phone?.message}
                  />
                </div>

                {/* Student ID */}
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    {...registerProfile('studentId')}
                    placeholder="STU12345"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    {...registerProfile('department')}
                    leftIcon={<Building className="h-4 w-4" />}
                    placeholder="Computer Science"
                    error={profileErrors.department?.message}
                  />
                </div>

                {/* Year of Study */}
                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <select
                      id="yearOfStudy"
                      {...registerProfile('yearOfStudy', { valueAsNumber: true })}
                      className="w-full pl-10 h-10 rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
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
                    <p className="text-sm text-destructive mt-1">
                      {profileErrors.yearOfStudy.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
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
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword')}
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword?.message}
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword')}
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Enter new password"
                  error={passwordErrors.newPassword?.message}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword?.message}
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  Make sure your new password is at least 8 characters long and contains a mix of letters, numbers, and special characters.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdating}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Appearance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize how ClubHub looks on your device
                  </p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label>Theme Preference</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        theme === 'light'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Sun className="h-6 w-6 text-foreground" />
                      <span className="text-sm font-medium text-foreground">Light</span>
                      {theme === 'light' && (
                        <span className="text-xs text-primary">Active</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Moon className="h-6 w-6 text-foreground" />
                      <span className="text-sm font-medium text-foreground">Dark</span>
                      {theme === 'dark' && (
                        <span className="text-xs text-primary">Active</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Preferences */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                      <p className="text-xs text-muted-foreground">Receive event updates via email</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
                    >
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Push Notifications</h4>
                      <p className="text-xs text-muted-foreground">Get notified about new events</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors"
                    >
                      <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};