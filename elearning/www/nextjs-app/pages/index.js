import Head from "next/head";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ExamSection from "../components/ExamSection";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export const metadata = {
  title: "Elearning - Nâng cao kỹ năng toán học của bạn",
  description:
    "Nền tảng học tập lấy học sinh làm trung tâm, hỗ trợ học toán và ôn luyện thi hiệu quả",
};

export default function Home() {
  return (
    <div>
      <Head>
        <title>Elearning - Nâng cao kỹ năng toán học của bạn</title>
        <meta
          name="description"
          content="Nền tảng học tập lấy học sinh làm trung tâm, hỗ trợ học toán và ôn luyện thi hiệu quả"
        />
        <link rel="icon" href="/images/education.png" type="image/png" />
      </Head>

      <Navbar />
      <main>
        <Hero />
        <ExamSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
