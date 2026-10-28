"use client";

import { useForm, ValidationError } from "@formspree/react";
import { motion } from "motion/react";
import React, { useState } from "react";

interface ServiceOption {
	id: string;
	label: string;
}

const serviceOptions: ServiceOption[] = [
	{ id: "full-experience", label: "Full Digital Experience" },
	{ id: "ui-design", label: "Bespoke UI/UX Design" },
	{ id: "frontend-dev", label: "Frontend Development" },
	{ id: "growth-ads", label: "Digital Growth & Ads" },
];

const socialLinks = [
	{
		name: "GitHub",
		href: "https://github.com/Bashar-alJabi",
		ariaLabel: "GitHub Profile",
		icon: (
			<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
				<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
			</svg>
		),
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/in/bashar-aljabi-engineer",
		ariaLabel: "LinkedIn Profile",
		icon: (
			<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
				<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
			</svg>
		),
	},
	// {
	// 	name: "Instagram",
	// 	href: "YOUR_INSTAGRAM_URL",
	// 	ariaLabel: "Instagram Profile",
	// 	icon: (
	// 		<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
	// 			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618-6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
	// 		</svg>
	// 	),
	// },
];

const contactEmail = "digitalperfumer@gmail.com";

export default function ContactSection() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		selectedService: "Full Digital Experience",
		message: "",
	});

	// const [isSubmitting, setIsSubmitting] = useState(false);
	// const [isSubmitted, setIsSubmitted] = useState(false);
	const [state, handleSubmit, reset] = useForm("mnpqzbbe");

	// const handleSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	setIsSubmitting(true);

	// 	// محاكاة إرسال البيانات (يمكن ربطها بـ API هنا)
	// 	await new Promise((resolve) => setTimeout(resolve, 1200));

	// 	setIsSubmitting(false);
	// 	setIsSubmitted(true);
	// };

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<section className="relative py-28 md:py-36 px-6 md:px-12 bg-perfume-bg text-perfume-text border-t border-perfume-soft/40 overflow-hidden">
			<div className="max-w-7xl mx-auto">
				<div className="contact-signature" aria-hidden="true">
					{[0, 1, 2].map(i => <span key={i} data-note-anchor={`contact-${i}`} />)}
				</div>
				{/* Main Contact Container */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">
					{/* Left Column: Call to Action & Direct Links */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="lg:col-span-5 space-y-10"
					>
						<div>
							<p className="dp-label uppercase tracking-[0.4em] font-semibold text-perfume-text/60">
								LET&apos;S CREATE
							</p>
							{/* <h2 className="mt-4 text-4xl md:text-6xl font-serif font-normal text-perfume-text leading-tight"> */}
							<h2 className="mt-4 dp-section-title font-normal text-perfume-text leading-tight">
								Let&apos;s compose your <br />
								<span className="italic text-perfume-primary">
									digital presence.
								</span>
							</h2>
						</div>

						<p className="dp-body font-light text-perfume-text/80 leading-relaxed">
							Every great digital experience starts with a conversation. Tell me
							about your brand, your goals, and what you want to create.
						</p>

						{/* Direct Contact Cards */}
						<div className="space-y-6 pt-4 border-t border-perfume-soft/50">
							{/* Email Link */}
							<div>
								<span className="dp-label uppercase tracking-widest text-perfume-text/50 block mb-1">
									Email
								</span>
								<a
									href={`mailto:${contactEmail}`}
									className="text-lg md:text-xl font-serif text-perfume-text hover:text-perfume-primary transition-colors duration-300 underline underline-offset-8 decoration-perfume-soft"
								>
									{contactEmail}
								</a>
							</div>

							{/* Status / Availability Badge */}
							<div>
								<span className="dp-label uppercase tracking-widest text-perfume-text/50 block mb-2">
									Availability
								</span>
								<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-perfume-surface border border-perfume-soft dp-label text-perfume-text">
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									<span>Available for New Projects</span>
								</div>
							</div>

							{/* Social Channels with Icons */}
							<div className="pt-2">
								<span className="dp-label uppercase tracking-widest text-perfume-text/50 block mb-3">
									Elsewhere
								</span>
								<div className="flex items-center gap-3">
									{socialLinks.map((social) => (
										<a
											key={social.name}
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={social.ariaLabel}
											className="w-11 h-11 rounded-2xl bg-perfume-surface border border-perfume-soft/80 flex items-center justify-center text-perfume-text hover:text-perfume-primary hover:border-perfume-primary/50 hover:scale-105 transition-all duration-300 shadow-sm"
										>
											{social.icon}
										</a>
									))}
								</div>
							</div>
						</div>
					</motion.div>

					{/* Right Column: Interactive Form */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="lg:col-span-7"
					>
						{/* <div className="rounded-3xl border border-perfume-soft bg-perfume-surface p-8 md:p-12 shadow-sm"> */}
						<div className="relative rounded-3xl bg-perfume-surface p-8 md:p-12 shadow-sm overflow-hidden">
							{/* Rotating border */}
							{/* Rotating border */}
							<svg
								className="pointer-events-none absolute inset-0 h-full w-full"
								preserveAspectRatio="none"
								viewBox="0 0 100 100"
							>
								<rect
									x="0"
									y="0"
									width="100"
									height="100"
									rx="4"
									fill="none"
									stroke="var(--primary-perfume)"
									strokeWidth="0.35"
									strokeDasharray="24 76"
									pathLength="100"
								>
									<animate
										attributeName="stroke-dashoffset"
										from="100"
										to="0"
										dur="8s"
										repeatCount="indefinite"
									/>
								</rect>
							</svg>

							{/* <div className="relative z-10"> */}
							{/* {isSubmitted ? ( */}
							{state.succeeded ? (
								<div className="py-16 text-center space-y-4">
									<span className="text-4xl block">✨</span>
									<h3 className="dp-card-title text-perfume-text">
										Message Received
									</h3>
									<p className="dp-body font-light text-perfume-text/75 max-w-md mx-auto">
										Thank you for reaching out. Your message has been received,
										and I’ll get back to you shortly.
									</p>
									<button
										type="button"
										onClick={() => {
											// setIsSubmitted(false);
											reset();
											setFormData({
												name: "",
												email: "",
												selectedService: serviceOptions[0].label,
												message: "",
											});
										}}
										className="mt-6 dp-label uppercase tracking-widest text-perfume-primary underline underline-offset-4 cursor-pointer"
									>
										Send Another Message
									</button>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-8">
									{/* Service Accord Selection */}
									<div>
										<label className="dp-label uppercase tracking-widest text-perfume-text/60 block mb-3">
											What can I help you with?
										</label>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{serviceOptions.map((option) => {
												const isSelected =
													formData.selectedService === option.label;
												return (
													<button
														type="button"
														key={option.id}
														aria-pressed={isSelected}
														onClick={() =>
															setFormData((prev) => ({
																...prev,
																selectedService: option.label,
															}))
														}
														className={`p-3.5 rounded-xl border text-left dp-label transition-all duration-300 cursor-pointer ${
															isSelected
																? "border-perfume-primary bg-perfume-bg text-perfume-text font-medium shadow-sm"
																: "border-perfume-soft/60 bg-perfume-bg/40 text-perfume-text/70 hover:border-perfume-primary/30"
														}`}
													>
														{option.label}
													</button>
												);
											})}
										</div>
										<input
											type="hidden"
											name="service"
											value={formData.selectedService}
										/>
									</div>

									{/* Name Input */}
									<div>
										<label
											htmlFor="contact-name"
											className="dp-label uppercase tracking-widest text-perfume-text/60 block mb-2"
										>
											Name
										</label>
										<input
											id="contact-name"
											name="name"
											type="text"
											required
											placeholder="Your name"
											value={formData.name}
											onChange={handleInputChange}
											className="w-full bg-perfume-bg border border-perfume-soft/80 rounded-xl p-4 dp-small text-perfume-text placeholder:text-perfume-text/30 focus:outline-none focus:border-perfume-primary transition-colors duration-300"
										/>
									</div>

									{/* Email Input */}
									<div>
										<label
											htmlFor="contact-email"
											className="dp-label uppercase tracking-widest text-perfume-text/60 block mb-2"
										>
											Email Address
										</label>
										<input
											id="contact-email"
											name="email"
											type="email"
											required
											placeholder="you@brand.com"
											value={formData.email}
											onChange={handleInputChange}
											className="w-full bg-perfume-bg border border-perfume-soft/80 rounded-xl p-4 dp-small text-perfume-text placeholder:text-perfume-text/30 focus:outline-none focus:border-perfume-primary transition-colors duration-300"
										/>
										<ValidationError
											prefix="Email"
											field="email"
											errors={state.errors}
										/>
									</div>

									{/* Message Input */}
									<div>
										<label
											htmlFor="contact-message"
											className="dp-label uppercase tracking-widest text-perfume-text/60 block mb-2"
										>
											Project Details
										</label>
										<textarea
											id="contact-message"
											name="message"
											rows={4}
											required
											placeholder="Tell me about your project, goals, or timeline..."
											value={formData.message}
											onChange={handleInputChange}
											className="w-full bg-perfume-bg border border-perfume-soft/80 rounded-xl p-4 dp-small text-perfume-text placeholder:text-perfume-text/30 focus:outline-none focus:border-perfume-primary transition-colors duration-300 resize-none"
										/>
										<ValidationError
											prefix="Message"
											field="message"
											errors={state.errors}
										/>
									</div>

									{/* {state.errors && (
										<p className="text-sm text-red-500 font-sans">
											Something went wrong while sending your message. Please
											try again.
										</p>
									)} */}

									{/* Submit Button */}
									<button
										type="submit"
										// disabled={isSubmitting}
										disabled={state.submitting}
										className="w-full py-4 rounded-xl bg-perfume-text text-perfume-bg hover:bg-perfume-primary hover:text-white disabled:opacity-50 transition-all duration-500 font-medium dp-small tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer"
									>
										{/* {isSubmitting ? ( */}
										{state.submitting ? (
											<span className="inline-block animate-pulse">
												Sending Message...
											</span>
										) : (
											<span>Start a Conversation →</span>
										)}
									</button>
								</form>
							)}
							{/* </div> */}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
