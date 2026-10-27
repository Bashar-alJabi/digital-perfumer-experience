export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} — All rights reserved.</span>
      <span className="footer-signature">
        Digital Perfumer <i /> By Bashar Al-Jabi
      </span>
      <a href="#home" aria-label="Scroll back to top of the page">
        Back to Top ↑
      </a>
    </footer>
  );
}
