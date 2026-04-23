import React, { useEffect } from "react";
import "./Background.css";

function Background() {
  useEffect(() => {
    const container = document.getElementById('bg-particles');
    if (!container) return;
    const colors = ['#81f133', '#15ffe0', '#582b7e', '#c837ab'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'bg-particle';
      const size = 1.5 + Math.random() * 2;
      const left = Math.random() * 100;
      const delay = Math.random() * 12;
      const duration = 8 + Math.random() * 12;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;
      container.appendChild(p);
    }
    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="bg-canvas" aria-hidden="true">
      <div className="bg-orb orb1"></div>
      <div className="bg-orb orb2"></div>
      <div className="bg-orb orb3"></div>
      <div className="bg-orb orb4"></div>
      <div id="bg-particles"></div>
    </div>
  );
}

export default Background;
