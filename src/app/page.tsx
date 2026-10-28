import ThreeNotesProvider from "@/components/three-notes/ThreeNotesProvider";
import CustomCursor from "@/components/cursor/CustomCursor";
import Footer from "@/components/layout/Footer";
import LoadingScreen from "@/components/layout/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import ScrollPerfumeBottle from "@/components/layout/ScrollPerfumeBottle";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import FormulaSection from "@/components/sections/FormulaSection";
import HeroSection from "@/components/sections/HeroSection";
import PhilosophySection from "@/components/sections/PhilosophySection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ScentMemorySection from "@/components/sections/ScentMemorySection";
import StatsSection from "@/components/sections/StatsSection";
import TechStackSection from "@/components/sections/TechStackSection";

export default function Home() {
	return (
		<main className="min-h-screen bg-perfume-bg text-perfume-text selection:bg-perfume-primary selection:text-white">
			<ThreeNotesProvider>
			<LoadingScreen />
			<noscript><style>{`.notes-loader { display: none !important; }`}</style></noscript>
			<CustomCursor />
			<ScrollPerfumeBottle />
			{/* Floating Capsule Navbar */}
			<Navbar />
			{/* Hero Section */}
			<section id="home">
				<HeroSection />
			</section>
			{/* Philosophy Section */}
			<section id="philosophy">
				<PhilosophySection />
			</section>
			{/* Formation Section */}
			<section id="formula">
				<FormulaSection />
			</section>
			{/* Craftsman / About Section */}
			<section id="about">
				<AboutSection />
			</section>
			{/* Impact Section */}
			<section id="impact">
				<StatsSection />
			</section>
			{/* Real-World Formulations / Projects Section */}
			<section id="work">
				<ProjectsSection />
			</section>
			{/* Scent Memory Section */}
			<section id="memory">
				<ScentMemorySection />
			</section>
			{/* Formulation Cabinet / Tech Stack Section */}
			<section id="skills">
				<TechStackSection />
			</section>
			{/* Contact Section */}
			<section id="contact">
				<ContactSection />
			</section>
			{/* Footer Component */}
			<Footer />
			</ThreeNotesProvider>
		</main>
	);
}
