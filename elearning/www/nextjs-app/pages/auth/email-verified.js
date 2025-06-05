import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';

const EmailVerifiedPage = () => {
  const router = useRouter();
  const { email } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto redirect to login after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/auth/login');
    }
  }, [countdown, router]);

  return (
    <AuthLayout title="Email Verified">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Email đã được xác minh!</h1>
        
        <p className="text-gray-600 mb-6">
          Địa chỉ email của bạn đã được xác minh thành công. Tài khoản của bạn đã được kích hoạt.
        </p>
        
        {email && (
          <p className="text-sm text-gray-500 mb-6">
            Email đã xác minh: {email}
          </p>
        )}
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700">
            Chuyển hướng đến trang đăng nhập trong <span className="font-bold text-indigo-600">{countdown}</span> giây...
          </p>
        </div>
        
        <Link 
          href="/auth/login" 
          className="w-full inline-block bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthLayout>
  );
};

export default EmailVerifiedPage; 