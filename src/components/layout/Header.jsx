import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export function Header({ onOpenModal }) {
  const { language, setLanguage, t } = useLanguage();

  const handleMenuToggle = () => {
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");
    if (navMenu && menuToggle) {
      const isActive = navMenu.classList.contains("active");
      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");
      document.body.style.overflow = isActive ? "" : "hidden";
    }
  };

  const handleNavClick = () => {
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");
    if (navMenu && menuToggle) {
      navMenu.classList.remove("active");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <a href="#">
                <img
                  src="SVG/gorizontal logo qizil mark,qora type.svg"
                  alt="Buran Consulting"
                  className="logo-img"
                />
              </a>
            </div>
            <ul className="nav-menu" id="navMenu">
              <li>
                <a href="#about" onClick={handleNavClick}>
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a href="#programs" onClick={handleNavClick}>
                  {t('nav.programs')}
                </a>
              </li>
              <li>
                <a href="#countries" onClick={handleNavClick}>
                  {t('nav.countries')}
                </a>
              </li>
              <li>
                <a href="#results" onClick={handleNavClick}>
                  {t('nav.results')}
                </a>
              </li>
              <li>
                <a href="#faq" onClick={handleNavClick}>
                  {t('nav.faq')}
                </a>
              </li>
            </ul>
            <div className="nav-actions">
              <a href="tel:+998712000811" className="phone-link">
                +998 71 200 08 11
              </a>
              <div className="language-toggle">
                <span
                  className={`lang ${language === 'uz' ? 'active' : ''}`}
                  onClick={() => setLanguage('uz')}
                >
                  Uz
                </span>
                <span
                  className={`lang ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  En
                </span>
              </div>
              <button className="btn-primary" onClick={onOpenModal}>
                {t('register')}
              </button>
              <button className="menu-toggle" id="menuToggle" onClick={handleMenuToggle}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
