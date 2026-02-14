import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiUser, HiMail, HiLockClosed, HiLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../../components';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../store/authStore';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileUpdate = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(data);
      setUser(res.data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password');
    }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { /* ignore */ }
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Profile Settings</h1>
        <p className="text-dark-400">Manage your account information and preferences</p>
      </div>

      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-dark-100 mb-1">{user?.name}</h2>
            <p className="text-lg text-dark-400 mb-3">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 text-sm rounded-full font-medium border border-primary-500/20">
                {user?.role}
              </span>
              <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full font-medium border border-green-500/20">
                Active
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
              <HiLogout className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-dark-100 mb-2">Personal Information</h3>
            <p className="text-sm text-dark-400">Update your basic account details</p>
          </div>
          <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-5">
            <div className="space-y-1">
              <Input
                label="Full Name"
                icon={<HiUser className="w-5 h-5" />}
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name')}
                className="text-base"
              />
            </div>
            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                icon={<HiMail className="w-5 h-5" />}
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register('email')}
                className="text-base"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={profileLoading} className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Security */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-dark-100 mb-2">Security Settings</h3>
            <p className="text-sm text-dark-400">Change your password to keep your account secure</p>
          </div>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-5">
            <div className="space-y-1">
              <Input
                label="Current Password"
                type="password"
                icon={<HiLockClosed className="w-5 h-5" />}
                error={passwordForm.formState.errors.oldPassword?.message}
                {...passwordForm.register('oldPassword')}
                className="text-base"
              />
            </div>
            <div className="space-y-1">
              <Input
                label="New Password"
                type="password"
                icon={<HiLockClosed className="w-5 h-5" />}
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
                className="text-base"
              />
            </div>
            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type="password"
                icon={<HiLockClosed className="w-5 h-5" />}
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
                className="text-base"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={passwordLoading} className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
