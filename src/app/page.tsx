import Atelier from "@/components/atelier/Atelier";
import Chapter from "@/components/atelier/Chapter";
import Navbar from "@/components/layout/Navbar";
import ScrollPerfumeBottle from "@/components/layout/ScrollPerfumeBottle";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import PhilosophySection from "@/components/sections/PhilosophySection";
import FormulaSection from "@/components/sections/FormulaSection";
import AboutSection from "@/components/sections/AboutSection";
import StatsSection from "@/components/sections/StatsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ScentMemorySection from "@/components/sections/ScentMemorySection";
import TechStackSection from "@/components/sections/TechStackSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <Atelier>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <ScrollPerfumeBottle />
      <main id="main-content">
        <Chapter index={0}>
          <HeroSection />
        </Chapter>
        <Chapter index={1}>
          <PhilosophySection />
        </Chapter>
        <Chapter index={2}>
          <FormulaSection />
        </Chapter>
        <Chapter index={3}>
          <AboutSection />
        </Chapter>
        <Chapter index={4}>
          <StatsSection />
        </Chapter>
        <Chapter index={5}>
          <ProjectsSection />
        </Chapter>
        <Chapter index={6}>
          <ScentMemorySection />
        </Chapter>
        <Chapter index={7}>
          <TechStackSection />
        </Chapter>
        <Chapter index={8}>
          <ContactSection />
          <Footer />
        </Chapter>
      </main>
    </Atelier>
  );
}
