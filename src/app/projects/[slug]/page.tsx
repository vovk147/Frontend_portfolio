import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ProjectDetail from "@/components/ProjectDetail/ProjectDetail";

// Next.js автоматически передает параметры маршрута в проп params
export default function ProjectPage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <Header />
      {/* Передаем slug внутрь компонента, чтобы он знал, какой проект искать */}
      <ProjectDetail slug={params.slug} />
      <Footer />
    </main>
  );
}