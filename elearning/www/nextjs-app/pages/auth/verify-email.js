import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import { parseCookies } from "nookies";

const VerifyEmailPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("Đang xác minh email của bạn, vui lòng đợi...");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { error: queryError, email: queryEmail } = router.query;

    if (queryError) {
      setStatus("error");
      
      if (queryError === "invalid_or_used_token") {
        setMessage("Liên kết xác minh không hợp lệ hoặc đã được sử dụng.");
      } else if (queryError === "expired_token") {
        setMessage("Liên kết xác minh đã hết hạn. Vui lòng yêu cầu một liên kết mới.");
      } else if (queryError === "user_not_found") {
        setMessage("Không tìm thấy tài khoản. Vui lòng thử đăng ký lại.");
      } else {
        setMessage("Đã xảy ra lỗi trong quá trình xác minh email. Vui lòng thử lại sau.");
      }
    } else if (Object.keys(router.query).length === 0 && !status) {
      setMessage("Vui lòng kiểm tra email của bạn để xác minh liên kết. Nếu bạn không nhận được nó, bạn có thể yêu cầu gửi lại.");
      
      const cookies = parseCookies();
      if (cookies.userEmail) {
        setUserEmail(cookies.userEmail);
      }
    }
  }, [router.query, router, status]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      setMessage("Vui lòng nhập email của bạn để gửi lại liên kết xác minh.");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Failed to resend verification email.");
      
      setMessage("Một email xác minh mới đã được gửi. Vui lòng kiểm tra hộp thư đến (và thư mục spam).");
    } catch (err) {
      setMessage(err.message || "Lỗi gửi email.");
    } finally {
      setLoading(false);
    }
  };
  
  const maskEmail = (email) => {
    if (!email) return "";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    
    const name = parts[0];
    const domain = parts[1];
    
    const maskedName = name.length <= 2 
      ? name 
      : name.charAt(0) + "*".repeat(Math.min(name.length - 2, 5)) + name.charAt(name.length - 1);
    
    return `${maskedName}@${domain}`;
  };

  if (status === "error") {
    return (
      <AuthLayout title="Xác minh thất bại">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4 text-red-600">Xác minh thất bại</h1>
          <p className="text-gray-700 mb-8">{message}</p>
          <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-800">
            Thử đăng ký lại
          </Link>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout title="Xác minh email của bạn">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Xác minh email của bạn</h1>
          <p className="text-gray-600">{message}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          {userEmail && (
            <div className="mb-5">
              <label htmlFor="emailResend" className="block text-sm font-medium text-gray-700 mb-1">
                Email của bạn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="emailResend" 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>
          )}
          
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi lại email xác minh"
            )}
          </button>
          
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
              Trở lại đăng nhập
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Kiểm tra thư mục spam nếu bạn không thấy email trong hộp thư đến.</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;