import React, { useState, useEffect } from "react";
import "./PageHeader.css";

function Header() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gadget-theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('gadget-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="https://GadgetHub.cse23.org" className="header-logo-link">
          <img
            src="./logo-header.png"
            alt="GadgetHub Logo"
            className="header-logo"
          />
        </a>
        <span className="header-title">CONVERT IMAGE TO PDF</span>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '\u2600\uFE0F Light' : '\uD83C\uDF19 Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
