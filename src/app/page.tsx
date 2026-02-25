"use client";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Contact from "@/components/Contact/Contact";
import Footer from "@/components/Footer/Footer";


export default function Home() {
  return (
    <main>
      <Header />

      <Hero />

      <About />
      <Skills />
      <Projects />
      < Contact/>

      <Footer/>
    </main>
  );
}
