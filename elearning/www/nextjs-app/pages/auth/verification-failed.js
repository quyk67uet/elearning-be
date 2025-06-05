import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';

const VerificationFailedPage = () => {
  const router = useRouter();
  const { error } = router.query;

  // Hiển thị thông báo lỗi thân thiện dựa trên mã lỗi
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'missing_token':
        return 'Không tìm thấy mã xác minh. Vui lòng sử dụng liên kết đầy đủ từ email.';
      case 'invalid_or_used_token':
        return 'Liên kết xác minh không hợp lệ hoặc đã được sử dụng.';
      case 'expired_token':
        return 'Liên kết xác minh đã hết hạn. Vui lòng yêu cầu một liên kết mới.';
      case 'user_not_found':
        return 'Không tìm thấy tài khoản. Địa chỉ email có thể đã bị xóa.';
      case 'setup_error':
        return 'Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ.';
      case 'server_error':
        return 'Đã xảy ra lỗi không ngờ. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
      default:
        return 'Xác minh thất bại. Vui lòng thử lại hoặc yêu cầu email xác minh mới.';
    }
  };

  return (
    <AuthLayout title="Xác minh thất bại">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Xác minh thất bại</h1>
        
        <p className="text-gray-600 mb-8">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/auth/verify-email"
            className="w-full inline-block bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Yêu cầu xác minh mới
          </Link>
          
          <Link 
            href="/auth/signup"
            className="w-full inline-block bg-white text-gray-700 border border-gray-300 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Đăng ký lại
          </Link>
          
          <Link 
            href="/"
            className="text-indigo-600 hover:text-indigo-800 inline-block mt-4"
          >
            Trở lại trang chủ
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerificationFailedPage; 