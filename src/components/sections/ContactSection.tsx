"use client";
import { useForm, ValidationError } from "@formspree/react";
import { useState } from "react";
const serviceOptions = [
  "Full Digital Experience",
  "Bespoke UI/UX Design",
  "Frontend Development",
  "Digital Growth & Ads",
];
export default function ContactSection() {
  const [service, setService] = useState(serviceOptions[0]);
  const [state, submit, reset] = useForm("mnpqzbbe");
  return (
    <div className="contact-layout">
      <div className="contact-copy">
        <p className="eyebrow">LET&apos;S CREATE</p>
        <h2>
          Let&apos;s compose your
          <br />
          <em>digital presence.</em>
        </h2>
        <p className="contact-intro">
          Every great digital experience starts with a conversation. Tell me
          about your brand, your goals, and what you want to create.
        </p>
        <div className="contact-direct">
          <div>
            <span className="eyebrow">Email</span>
            <a href="mailto:digitalperfumer@gmail.com">
              digitalperfumer@gmail.com
            </a>
          </div>
          <div>
            <span className="eyebrow">Availability</span>
            <span className="availability">
              <i />
              Available for New Projects
            </span>
          </div>
          <div>
            <span className="eyebrow">Elsewhere</span>
            <div className="social-text">
              <a
                href="https://github.com/Bashar-alJabi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com/in/bashar-aljabi-engineer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="contact-form-panel">
        {state.succeeded ? (
          <div className="form-success" role="status">
            <span aria-hidden="true">✦</span>
            <h3>Message Received</h3>
            <p>
              Thank you for reaching out. Your message has been received, and
              I’ll get back to you shortly.
            </p>
            <button
              onClick={() => {
                reset();
                setService(serviceOptions[0]);
              }}
              className="action-link"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <fieldset>
              <legend>What can I help you with?</legend>
              <div className="service-options">
                {serviceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={option === service}
                    onClick={() => setService(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
            <input type="hidden" name="service" value={service} />
            <div className="form-row">
              <div>
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@brand.com"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-message">Project Details</label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                required
                placeholder="Tell me about your project, goals, or timeline..."
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
            </div>
            <ValidationError errors={state.errors} />
            <button
              type="submit"
              disabled={state.submitting}
              className="form-submit"
            >
              {state.submitting
                ? "Sending Message..."
                : "Start a Conversation →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
