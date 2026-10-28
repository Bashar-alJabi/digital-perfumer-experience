import Experience from "@/components/experience/Experience";
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
			<Experience>
			<LoadingScreen />
			<noscript><style>{`[aria-label="Entering Digital Perfumer"] { display: none !important; }`}</style></noscript>
			<CustomCursor />
			<ScrollPerfumeBottle />
			{/* Floating Capsule Navbar */}
			<Navbar />
			{/* Hero Section */}
			<section id="home" className="chapter chapter-home">
				<HeroSection />
			</section>
			{/* Philosophy Section */}
			<section id="philosophy" className="chapter chapter-philosophy">
				<PhilosophySection />
			</section>
			{/* Formation Section */}
			<section id="formula" className="chapter chapter-formula">
				<FormulaSection />
			</section>
			{/* Craftsman / About Section */}
			<section id="about" className="chapter chapter-about">
				<AboutSection />
			</section>
			{/* Impact Section */}
			<section id="impact" className="chapter chapter-impact">
				<StatsSection />
			</section>
			{/* Real-World Formulations / Projects Section */}
			<section id="work" className="chapter chapter-work">
				<ProjectsSection />
			</section>
			{/* Scent Memory Section */}
			<section id="memory" className="chapter chapter-memory">
				<ScentMemorySection />
			</section>
			{/* Formulation Cabinet / Tech Stack Section */}
			<section id="skills" className="chapter chapter-skills">
				<TechStackSection />
			</section>
			{/* Contact Section */}
			<section id="contact" className="chapter chapter-contact">
				<ContactSection />
			</section>
			{/* Footer Component */}
			<div id="signature" className="chapter chapter-signature"><div className="signature-settle" aria-hidden="true"><span className="identity-dots"><i/><i/><i/></span></div><Footer /></div>
			</Experience>
		</main>
	);
}
