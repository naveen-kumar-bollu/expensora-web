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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-dark-100">Profile</h1>

      {/* Account Info */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-100">{user?.name}</h3>
            <p className="text-sm text-dark-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <Input
            label="Name"
            icon={<HiUser className="w-5 h-5" />}
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <Input
            label="Email"
            type="email"
            icon={<HiMail className="w-5 h-5" />}
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register('email')}
          />
          <Button type="submit" loading={profileLoading}>
            Update Profile
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={<HiLockClosed className="w-5 h-5" />}
            error={passwordForm.formState.errors.oldPassword?.message}
            {...passwordForm.register('oldPassword')}
          />
          <Input
            label="New Password"
            type="password"
            icon={<HiLockClosed className="w-5 h-5" />}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            icon={<HiLockClosed className="w-5 h-5" />}
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <Button type="submit" loading={passwordLoading}>
            Change Password
          </Button>
        </form>
      </Card>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-dark-100">Sign Out</h3>
            <p className="text-sm text-dark-400">Logout from your account</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <HiLogout className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
