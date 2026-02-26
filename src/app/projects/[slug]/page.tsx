import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ProjectDetail from "@/components/ProjectDetail/ProjectDetail";

// 1. Делаем компонент async
// 2. Указываем, что params — это Promise
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  // 3. Дожидаемся распаковки параметров
  const resolvedParams = await params;

  return (
    <main>
      <Header />
      {/* 4. Передаем уже распакованный slug */}
      <ProjectDetail slug={resolvedParams.slug} />
      <Footer />
    </main>
  );
}