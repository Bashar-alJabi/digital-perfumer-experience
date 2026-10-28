"use client";


import PhilosophyStage from "@/components/cinematic/PhilosophyStage";

const notes = [
	{
		number: "01",
		title: "TOP NOTES",
		subtitle: "First Impression — How your brand is seen",
		text: "Crafting bespoke brand identity, UI/UX design, visual direction, typography, and landing pages that capture immediate emotional resonance.",
	},
	{
		number: "02",
		title: "HEART NOTES",
		subtitle: "The Experience — How your brand is experienced",
		text: "Transforming design into fluid digital reality through responsive frontend engineering, interactive motion, accessibility, and high performance.",
	},
	{
		number: "03",
		title: "BASE NOTES",
		subtitle: "Lasting Impact — How your brand grows",
		text: "Building lasting growth through digital strategy, advertising campaigns, SEO, conversion optimization, and continuous improvement.",
	},
];

const signatureDots = [
	{ title: "Top Note", baseClass: "bg-perfume-primary" },
	{
		title: "Heart Note",
		baseClass: "bg-perfume-soft border border-perfume-primary/40",
	},
	{ title: "Base Note", baseClass: "bg-perfume-text" },
];

export default function PhilosophySection() {
	return (
		<section className="relative px-6 py-32 text-perfume-text md:px-12 md:py-44">
			<PhilosophyStage />
			<div className="philosophy-inner mx-auto max-w-7xl">
				{/* Philosophy */}
				<div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
					{/* Left Sticky Manifesto Title */}
					<div
						className="philosophy-manifesto h-fit lg:sticky lg:top-32"
					>
						<p className="dp-label font-semibold uppercase tracking-[0.4em] text-perfume-text/60">
							The Philosophy
						</p>

						<h2 className="dp-section-title mt-8 font-normal leading-[0.95] tracking-tight text-perfume-text">
							I don&apos;t build
							<br />
							<span className="text-perfume-text/40">websites.</span>
							<br />
							I compose
							<br />
							<span className="italic text-perfume-primary">
								digital scents.
							</span>
						</h2>
					</div>

					{/* Notes */}
					<div className="space-y-8 philosophy-notes">
						{notes.map((note, cardIndex) => (
							<div
								key={note.number}
								className="note-morph-card relative overflow-hidden rounded-3xl border border-perfume-soft bg-perfume-surface p-8 shadow-sm md:p-12"
							>
								{/* Background Number */}
								<div className="note-morph-number pointer-events-none absolute -top-6 right-6 select-none font-serif text-[120px] font-bold tracking-tighter text-perfume-primary/10">
									{note.number}
								</div>

								<div className="note-morph-content relative z-10">
									{/* Signature Dots */}
									<div className="note-morph-dots mb-8 flex items-center gap-4">
										{signatureDots.map((dot, dotIndex) => {
											const isActive = dotIndex === cardIndex;

											return (
												<span
													key={dot.title}
													title={dot.title}
													className={`h-3 w-3 rounded-full transition-all duration-500 ${
														dot.baseClass
													} ${
														isActive
															? "scale-125 ring-4 ring-perfume-primary/20 shadow-[0_0_12px_rgba(243,99,113,0.5)] opacity-100"
															: "scale-90 opacity-35"
													}`}
												/>
											);
										})}
									</div>

									<h3 className="dp-card-title font-normal text-perfume-text">
										{note.title}
									</h3>

									<p className="dp-small mt-2 font-medium uppercase tracking-[0.3em] text-perfume-primary">
										{note.subtitle}
									</p>

									<p className="dp-body mt-6 max-w-md font-light leading-relaxed text-perfume-text/80">
										{note.text}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
