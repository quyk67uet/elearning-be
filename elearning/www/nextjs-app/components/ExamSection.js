import React from 'react';
import Image from 'next/image';

const ExamSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-16">Thiết kế riêng cho các kỳ thi Toán</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Kỳ thi tốt nghiệp phổ thông Ireland */}
          <div className="flex flex-col items-center">
            <div className="mb-6 w-full h-[288px] overflow-hidden rounded-lg relative">
              <Image
                src="/images/leaving_cert.jpg"
                alt="Kỳ thi tốt nghiệp phổ thông Ireland"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="w-full h-full"
              />
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-center">Kỳ thi tốt nghiệp phổ thông Ireland</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Chúng tôi hỗ trợ học sinh Ireland chuẩn bị cho kỳ thi tốt nghiệp phổ thông bằng cách cung cấp tài liệu Toán chất lượng cao, các câu hỏi luyện tập và sự hướng dẫn từ chuyên gia. Nền tảng của chúng tôi giúp học sinh củng cố kiến thức và đạt kết quả cao trong kỳ thi.
            </p>
          </div>
          
          {/* Kỳ thi tuyển sinh vào lớp 10 tại Việt Nam */}
          <div className="flex flex-col items-center">
            <div className="mb-6 w-full h-[288px] overflow-hidden rounded-lg relative">
              <Image
                src="/images/vietnam_exam.jpg"
                alt="Kỳ thi tuyển sinh vào lớp 10 tại Việt Nam"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="w-full h-full"
              />
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-center">Kỳ thi tuyển sinh vào lớp 10 tại Việt Nam</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Chúng tôi đồng hành cùng học sinh Việt Nam trong quá trình ôn luyện kỳ thi tuyển sinh vào lớp 10 bằng các tài liệu Toán học toàn diện, bài tập luyện tập và lời giải chi tiết. Nền tảng của chúng tôi giúp học sinh xây dựng nền tảng Toán vững chắc và đạt kết quả cao.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExamSection;
