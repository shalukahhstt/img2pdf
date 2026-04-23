import React, { useEffect } from "react";
import "./Preloader.css";

function Preloader() {
  useEffect(() => {
    const el = document.getElementById('preloader');
    const hide = () => {
      if (el) {
        el.classList.add('hidden');
        setTimeout(() => {
          if (el) el.style.display = 'none';
        }, 400);
      }
    };
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide);
      return () => window.removeEventListener('load', hide);
    }
  }, []);

  return (
    <div id="preloader">
      <div className="preloader-spinner"></div>
    </div>
  );
}

export default Preloader;
