import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      const { token, refreshToken } = response.data;

      // Store tokens first so the axios interceptor can use them
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      useAuthStore.setState({ token, refreshToken });

      const userResponse = await authService.getMe();
      setAuth(userResponse.data, token, refreshToken);

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-dark-100 mb-6">Sign in to your account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<HiMail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<HiLockClosed className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-center text-dark-400 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
