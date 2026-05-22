import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getApiError } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

export default function Login() {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const form = useForm({ resolver: zodResolver(loginSchema) });
  const changeForm = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data);
      if (result.user.mustChangePassword) {
        setShowChangePassword(true);
      } else {
        toast.success('Welcome back!');
        navigate(result.user.role === 'ADMIN' ? '/admin' : from, { replace: true });
      }
    } catch (err) {
      toast.error(typeof getApiError(err) === 'string' ? getApiError(err) : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      const updated = await authService.changePassword(data);
      updateUser(updated);
      setShowChangePassword(false);
      toast.success('Password changed successfully');
      navigate(updated.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(typeof getApiError(err) === 'string' ? getApiError(err) : 'Failed to change password');
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Login</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to your Maala Clothing account</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <Input label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
          <Button type="submit" loading={loading} className="w-full">Login</Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-rose-600 hover:text-rose-700">Register</Link>
        </p>
      </div>

      <Modal open={showChangePassword} onClose={() => {}} title="Change Password Required" size="sm">
        <p className="mb-4 text-sm text-gray-600">
          For security, you must change your password before continuing.
        </p>
        <form onSubmit={changeForm.handleSubmit(onChangePassword)} className="space-y-4">
          <Input label="Current Password" type="password" {...changeForm.register('currentPassword')} error={changeForm.formState.errors.currentPassword?.message} />
          <Input label="New Password" type="password" {...changeForm.register('newPassword')} error={changeForm.formState.errors.newPassword?.message} />
          <Button type="submit" className="w-full">Change Password</Button>
        </form>
      </Modal>
    </div>
  );
}
