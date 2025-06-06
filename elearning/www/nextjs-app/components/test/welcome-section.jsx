"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function WelcomeSection() {
  const [roomName, setRoomName] = useState("Test Room");

  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 md:mr-6">
          <h2 className="text-3xl font-bold mb-2">
            Chào mừng đến với <span className="text-blue-500">{roomName}</span>!
          </h2>
          <p className="text-gray-600 mb-2">
            {/* The{" "} */}
            <Link href="#" className="text-blue-500 hover:underline">
              Test Room
            </Link>{" "}
            giúp bạn biết mình đã biết gì và sẵn sàng học gì tiếp theo.
          </p>
          <p className="text-gray-600 mb-4">
            Hãy thường xuyên truy cập Phân tích để xem sự thay đổi thống kê của
            bạn và nhận các gợi ý mới sau khi hoàn thành bài kiểm tra!
          </p>

          <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
            <div className="flex items-center mb-2">
              <svg
                className="w-4 h-4 text-blue-500 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Cấp độ:</span>
              <span className="text-sm ml-1">Người mới bắt đầu</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-blue-500 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Tiến độ:</span>
              <span className="text-sm ml-1">Đã hoàn thành 20%</span>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-1/3 h-48 md:h-64">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Math_Elearning-lXtT46HwN4yrEEUJLnF8HZTWUh6sxB.png"
            alt="Minh họa E-learning"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
