import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Archive from "@/components/Archive/Archive";

export const metadata = {
  title: "Project Archive | Yevhen Vovk",
  description: "Full database of development projects and experiments.",
};

export default function ArchivePage() {
  return (
    <main>
      <Header />
      <Archive />
      <Footer />
    </main>
  );
}