import React from 'react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="SVG/gorizontal logo oq.svg" alt="Buran Consulting" className="footer-logo-img" />
            </div>
            <p>Eng yaxshi universitetlar talabasi bo'ling</p>
          </div>
          <div className="footer-section">
            <h4>Sahifalar</h4>
            <ul>
              <li><a href="#about">Biz haqimizda</a></li>
              <li><a href="#programs">Bizning dasturlar</a></li>
              <li><a href="#countries">Davlatlar</a></li>
              <li><a href="#results">Natijalar</a></li>
              <li><a href="#faq">Savollar</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Aloqa</h4>
            <p><a href="tel:+998712000811">+998 71 200 08 11</a></p>
            <p><a href="mailto:info@buranconsulting.uz">info@buranconsulting.uz</a></p>
            <div className="footer-address">
              <p>
                <strong>MANZIL:</strong> Toshkent shahri, Mirzo Ulug'bek t,
                5-y proyezd Sayram 4A. Sayram bizness markazi, 7-etaj
              </p>
              <p><strong>Ⓜ️</strong> Buyuk ipak yo'li Metro 5-6 daqiqa.</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Buran Consulting. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
