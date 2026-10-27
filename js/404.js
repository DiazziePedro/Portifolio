/**
 * ============================================================================
 * PÁGINA 404 — LUCCAS DIAZZI
 * Lógica da Sequência de Erro e Perda de Sinal de Vídeo (SMPTE Bars)
 * ============================================================================
 */

(function () {
  'use strict';

  const DOM = {
    screen: document.getElementById('error-screen'),
    glitchLayer: document.getElementById('glitch-layer'),
    smpteOverlay: document.getElementById('smpte-overlay'),
    backBtn: document.getElementById('go-back-btn'),
    clockDisplay: document.getElementById('clock-display'),
    sessionDisplay: document.getElementById('session-display')
  };

  const startTime = Date.now();

  // 1. Relógio e Contador
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (DOM.clockDisplay) DOM.clockDisplay.textContent = `${h}:${m}:${s}`;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const eh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const em = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const es = String(elapsed % 60).padStart(2, '0');
    if (DOM.sessionDisplay) DOM.sessionDisplay.textContent = `ERR ${eh}:${em}:${es}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // 2. Transição de Perda de Sinal após ~3.5 segundos
  function init404Animation() {
    setTimeout(() => {
      // Breve glitch de choque
      if (DOM.glitchLayer) {
        DOM.glitchLayer.classList.add('glitch-active');
      }

      setTimeout(() => {
        // Ativa padrão SMPTE Color Bars
        if (DOM.smpteOverlay) {
          DOM.smpteOverlay.classList.add('is-active');
        }
      }, 400);

    }, 3500);
  }

  // 3. Voltar à página anterior com fallback
  function handleGoBack(e) {
    if (e) e.preventDefault();

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  }

  // Eventos de clique
  DOM.backBtn?.addEventListener('click', handleGoBack);

  // Se o usuário clicar nas barras SMPTE, restaura a tela 404
  DOM.smpteOverlay?.addEventListener('click', () => {
    DOM.smpteOverlay.classList.remove('is-active');
  });

  // Tecla ESC ou Backspace volta
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      handleGoBack();
    }
  });

  init404Animation();
})();
