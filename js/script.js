/**
 * ============================================================================
 * PORTFÓLIO INTERATIVO — LUCCAS DIAZZI
 * Lógica JavaScript Modular, Pura e Sem Dependências Externas
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONFIGURAÇÕES & ESTADO GLOBAL
  // --------------------------------------------------------------------------
  const CONFIG = {
    // Duração da animação inicial do logo LD em milissegundos
    bootDurationMs: 4000,
    // Velocidade de deslocamento do logo LD (pixels por quadro normalizado)
    dvdSpeed: 2.4,
    // Duração da interferência de glitch (ms)
    glitchDurationMs: 450,
    // Cooldown para rolagem do carrossel (ms) para evitar giros descontrolados
    scrollCooldownMs: 380
  };

  const STATE = {
    isBooting: true,
    isTransitioning: false,
    isTapeInserted: false,
    activeSection: null, // null | 0 | 1 | 2
    carouselIndex: 0,    // 0: Sobre mim, 1: Portfólio, 2: Contato
    sessionStartTime: Date.now(),
    audioContext: null
  };

  // --------------------------------------------------------------------------
  // 2. ELEMENTOS DO DOM
  // --------------------------------------------------------------------------
  const DOM = {
    cameraRig: document.getElementById('camera-rig'),
    bootLayer: document.getElementById('boot-screen-layer'),
    dvdStage: document.getElementById('dvd-stage'),
    ldLogo: document.getElementById('ld-logo'),
    skipBootBtn: document.getElementById('skip-boot-btn'),
    glitchLayer: document.getElementById('glitch-layer'),
    introCassette: document.getElementById('intro-cassette'),
    cassettePrompt: document.getElementById('cassette-prompt'),
    osInterface: document.getElementById('os-interface'),
    carouselViewport: document.getElementById('carousel-viewport'),
    carouselCards: Array.from(document.querySelectorAll('.carousel-card')),
    carouselDots: Array.from(document.querySelectorAll('.carousel-dot')),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    sectionOverlay: document.getElementById('section-view-overlay'),
    sectionTitleDisplay: document.getElementById('section-title-display'),
    sectionBackBtn: document.getElementById('section-back-btn'),
    sectionPanels: [
      document.getElementById('panel-about'),
      document.getElementById('panel-portfolio'),
      document.getElementById('panel-contact')
    ],
    clockDisplay: document.getElementById('clock-display'),
    sessionDisplay: document.getElementById('session-display'),
    copyEmailBtn: document.getElementById('copy-email-btn')
  };

  // --------------------------------------------------------------------------
  // 3. EFEITOS SONOROS RETRÔ (Sintetizador Web Audio API Não-Intrusivo)
  // --------------------------------------------------------------------------
  function playMechanicalClick(frequency = 120, duration = 0.04) {
    try {
      if (!STATE.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) STATE.audioContext = new AudioCtx();
      }
      if (!STATE.audioContext || STATE.audioContext.state === 'suspended') {
        STATE.audioContext?.resume();
      }
      if (!STATE.audioContext) return;

      const osc = STATE.audioContext.createOscillator();
      const gain = STATE.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, STATE.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, STATE.audioContext.currentTime + duration);

      gain.gain.setValueAtTime(0.08, STATE.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, STATE.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(STATE.audioContext.destination);

      osc.start();
      osc.stop(STATE.audioContext.currentTime + duration);
    } catch {
      // Ignora silenciosamente em navegadores com restrições de áudio
    }
  }

  // --------------------------------------------------------------------------
  // 4. ANIMAÇÃO INICIAL — DVD BOUNCE DO LOGO LD
  // --------------------------------------------------------------------------
  let dvdAnimationId = null;
  let dvdPos = { x: 50, y: 50 };
  let dvdVel = { dx: 1, dy: 1 };
  let bootTimeout = null;

  function initBootAnimation() {
    if (!DOM.ldLogo || !DOM.dvdStage) return;

    // Posição inicial no terço superior
    const stageWidth = DOM.dvdStage.clientWidth || window.innerWidth;
    const stageHeight = DOM.dvdStage.clientHeight || window.innerHeight;
    
    dvdPos.x = Math.max(20, (stageWidth - DOM.ldLogo.offsetWidth) * 0.35);
    dvdPos.y = Math.max(20, (stageHeight - DOM.ldLogo.offsetHeight) * 0.35);

    // Direções com leve ângulo estético
    dvdVel.dx = CONFIG.dvdSpeed;
    dvdVel.dy = CONFIG.dvdSpeed * 0.85;

    let lastTime = performance.now();

    function step(currentTime) {
      if (!STATE.isBooting) return;

      const deltaTime = Math.min((currentTime - lastTime) / 16.66, 2.0);
      lastTime = currentTime;

      const bounds = DOM.dvdStage.getBoundingClientRect();
      const logoWidth = DOM.ldLogo.offsetWidth || 140;
      const logoHeight = DOM.ldLogo.offsetHeight || 80;

      const maxX = bounds.width - logoWidth;
      const maxY = bounds.height - logoHeight;

      dvdPos.x += dvdVel.dx * deltaTime;
      dvdPos.y += dvdVel.dy * deltaTime;

      // Colisão na Borda Direita
      if (dvdPos.x >= maxX) {
        dvdPos.x = maxX;
        dvdVel.dx = -Math.abs(dvdVel.dx);
        onDvdBounce();
      }
      // Colisão na Borda Esquerda
      else if (dvdPos.x <= 0) {
        dvdPos.x = 0;
        dvdVel.dx = Math.abs(dvdVel.dx);
        onDvdBounce();
      }

      // Colisão na Borda Inferior
      if (dvdPos.y >= maxY) {
        dvdPos.y = maxY;
        dvdVel.dy = -Math.abs(dvdVel.dy);
        onDvdBounce();
      }
      // Colisão na Borda Superior
      else if (dvdPos.y <= 0) {
        dvdPos.y = 0;
        dvdVel.dy = Math.abs(dvdVel.dy);
        onDvdBounce();
      }

      DOM.ldLogo.style.transform = `translate3d(${dvdPos.x.toFixed(1)}px, ${dvdPos.y.toFixed(1)}px, 0)`;

      dvdAnimationId = requestAnimationFrame(step);
    }

    dvdAnimationId = requestAnimationFrame(step);

    // Finalização programada da tela de boot
    bootTimeout = setTimeout(() => {
      finishBootSequence();
    }, CONFIG.bootDurationMs);

    // Botão de pular intro
    DOM.skipBootBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      finishBootSequence();
    });

    // Pular com tecla de espaço ou esc
    window.addEventListener('keydown', function handleSkipKey(e) {
      if (STATE.isBooting && (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter')) {
        finishBootSequence();
        window.removeEventListener('keydown', handleSkipKey);
      }
    });
  }

  function onDvdBounce() {
    // Sutil vibração monocromática ao quicar
    DOM.ldLogo.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.7)';
    setTimeout(() => {
      if (DOM.ldLogo) DOM.ldLogo.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
    }, 120);
  }

  function finishBootSequence() {
    if (!STATE.isBooting) return;
    STATE.isBooting = false;

    if (bootTimeout) clearTimeout(bootTimeout);
    if (dvdAnimationId) cancelAnimationFrame(dvdAnimationId);

    // Transição Cinemática: Revelação do Computador e Toca-Fitas
    initComputerReveal();
  }

  // --------------------------------------------------------------------------
  // 5. TRANSIÇÃO CINEMÁTICA — AFASTAMENTO DA CÂMERA & REVELAÇÃO DO SETUP FÍSICO
  // --------------------------------------------------------------------------
  function initComputerReveal() {
    if (!DOM.cameraRig) return;

    // A câmera se afasta, revelando a carcaça do monitor e o toca-fitas
    DOM.cameraRig.classList.remove('camera--initial');
    DOM.cameraRig.classList.add('camera--pulled-back');

    playMechanicalClick(180, 0.08);

    // Prepara a fita cassete para apresentação
    setTimeout(() => {
      initCassetteAnimation();
    }, 800);
  }

  // --------------------------------------------------------------------------
  // 6. APRESENTAÇÃO E INSERÇÃO DA FITA CASSETE
  // --------------------------------------------------------------------------
  function initCassetteAnimation() {
    if (!DOM.introCassette) return;

    // Configura o evento de clique na fita emergente
    function handleInsert() {
      if (STATE.isTapeInserted || STATE.isTransitioning) return;
      STATE.isTapeInserted = true;
      STATE.isTransitioning = true;

      playMechanicalClick(90, 0.12);

      // Oculta o badge de aviso
      if (DOM.cassettePrompt) {
        DOM.cassettePrompt.style.display = 'none';
      }

      // Executa a animação de descida física para dentro do compartimento
      DOM.introCassette.classList.remove('tape--emerging');
      DOM.introCassette.classList.add('tape--inserting');

      // Quando a fita atinge o fundo do compartimento:
      setTimeout(() => {
        playMechanicalClick(65, 0.2);

        // Dispara glitch e interferência na tela do CRT
        triggerGlitch(CONFIG.glitchDurationMs);

        // A câmera se aproxima e foca na tela do computador
        DOM.cameraRig.classList.remove('camera--pulled-back');
        DOM.cameraRig.classList.add('camera--screen-focused');

        // Esconde a camada de boot e revela a interface do OS interno
        DOM.bootLayer?.classList.add('is-hidden');
        DOM.osInterface?.classList.add('is-active');

        STATE.isTransitioning = false;

        // Foca no carrossel para navegação acessível imediata
        DOM.carouselViewport?.focus();
      }, 700);
    }

    DOM.introCassette.addEventListener('click', handleInsert);
    DOM.introCassette.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInsert();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. EFEITO DE GLITCH & INTERFERÊNCIA CRT
  // --------------------------------------------------------------------------
  function triggerGlitch(duration = 450) {
    if (!DOM.glitchLayer) return;

    DOM.glitchLayer.classList.remove('glitch-active');
    // Força reflow para reiniciar animação CSS
    void DOM.glitchLayer.offsetWidth;
    DOM.glitchLayer.classList.add('glitch-active');

    setTimeout(() => {
      DOM.glitchLayer.classList.remove('glitch-active');
    }, duration);
  }

  // --------------------------------------------------------------------------
  // 8. CARROSSEL CIRCULAR 3D DE FITAS CASSETE
  // --------------------------------------------------------------------------
  let lastScrollTime = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function initCarousel() {
    updateCarouselPositions();

    // Rotação com a roda do mouse (Scroll vertical)
    window.addEventListener('wheel', handleMouseWheel, { passive: false });

    // Gestos de toque (Swiping para celulares e tablets)
    if (DOM.carouselViewport) {
      DOM.carouselViewport.addEventListener('touchstart', handleTouchStart, { passive: true });
      DOM.carouselViewport.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Botões de navegação lateral
    DOM.btnPrev?.addEventListener('click', () => rotateCarousel(-1));
    DOM.btnNext?.addEventListener('click', () => rotateCarousel(1));

    // Indicadores / Pontos
    DOM.carouselDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        if (STATE.carouselIndex !== idx && !STATE.isTransitioning && STATE.activeSection === null) {
          STATE.carouselIndex = idx;
          updateCarouselPositions();
          playMechanicalClick(200, 0.03);
        }
      });
    });

    // Clique nas próprias cartas
    DOM.carouselCards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (STATE.isTransitioning || STATE.activeSection !== null) return;

        if (STATE.carouselIndex === idx) {
          // Clique na fita central: Abre a seção!
          openSection(idx);
        } else {
          // Clique em fita lateral: Move para o centro
          STATE.carouselIndex = idx;
          updateCarouselPositions();
          playMechanicalClick(200, 0.03);
        }
      });

      // Navegação por teclado nas cartas
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (STATE.carouselIndex === idx) {
            openSection(idx);
          } else {
            STATE.carouselIndex = idx;
            updateCarouselPositions();
          }
        }
      });
    });

    // Navegação global por setas direcionais
    window.addEventListener('keydown', handleKeyDown);
  }

  function handleMouseWheel(e) {
    // Não interfere se o usuário estiver navegando dentro de uma seção aberta
    if (STATE.activeSection !== null || !STATE.isTapeInserted || STATE.isTransitioning) {
      return;
    }

    const now = performance.now();
    if (now - lastScrollTime < CONFIG.scrollCooldownMs) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
      e.preventDefault();
      lastScrollTime = now;
      const direction = (e.deltaY > 0 || e.deltaX > 0) ? 1 : -1;
      rotateCarousel(direction);
    }
  }

  function handleTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (STATE.activeSection !== null || !STATE.isTapeInserted || STATE.isTransitioning) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    // Detecta arrasto horizontal ou vertical relevante
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      rotateCarousel(diffX < 0 ? 1 : -1);
    } else if (Math.abs(diffY) > 40) {
      rotateCarousel(diffY < 0 ? 1 : -1);
    }
  }

  function handleKeyDown(e) {
    if (!STATE.isTapeInserted || STATE.isTransitioning) return;

    // Se estiver dentro de uma seção, a tecla ESC ou Backspace retorna ao carrossel
    if (STATE.activeSection !== null) {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        returnToCarousel();
      }
      return;
    }

    // Carrossel: Setas navegam
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      rotateCarousel(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      rotateCarousel(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      openSection(STATE.carouselIndex);
    }
  }

  function rotateCarousel(step) {
    const total = DOM.carouselCards.length;
    STATE.carouselIndex = (STATE.carouselIndex + step + total) % total;
    updateCarouselPositions();
    playMechanicalClick(210, 0.035);
  }

  function updateCarouselPositions() {
    const total = DOM.carouselCards.length;
    const current = STATE.carouselIndex;

    DOM.carouselCards.forEach((card, index) => {
      // Remove posições anteriores
      card.classList.remove('pos-center', 'pos-right', 'pos-left');

      if (index === current) {
        card.classList.add('pos-center');
        card.setAttribute('aria-selected', 'true');
      } else if (index === (current + 1) % total) {
        card.classList.add('pos-right');
        card.setAttribute('aria-selected', 'false');
      } else {
        card.classList.add('pos-left');
        card.setAttribute('aria-selected', 'false');
      }
    });

    // Atualiza indicadores visuais (dots)
    DOM.carouselDots.forEach((dot, idx) => {
      if (idx === current) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. TRANSIÇÃO DE ENTRADA & SAÍDA DAS SEÇÕES
  // --------------------------------------------------------------------------
  const SECTION_TITLES = ['SOBRE MIM', 'PORTFÓLIO', 'CONTATO'];

  function openSection(index) {
    if (STATE.isTransitioning) return;
    STATE.isTransitioning = true;
    STATE.activeSection = index;

    playMechanicalClick(140, 0.08);

    // Dispara transição de interferência rápida (glitch)
    triggerGlitch(CONFIG.glitchDurationMs);

    setTimeout(() => {
      // Atualiza título do breadcrumb
      if (DOM.sectionTitleDisplay) {
        DOM.sectionTitleDisplay.textContent = SECTION_TITLES[index] || 'SEÇÃO';
      }

      // Ativa painel correspondente
      DOM.sectionPanels.forEach((panel, pIdx) => {
        if (pIdx === index) {
          panel?.classList.add('is-visible');
        } else {
          panel?.classList.remove('is-visible');
        }
      });

      // Abre overlay da seção
      DOM.sectionOverlay?.classList.add('is-active');
      DOM.sectionOverlay?.setAttribute('aria-hidden', 'false');
      DOM.sectionBackBtn?.focus();

      STATE.isTransitioning = false;
    }, 200);
  }

  function returnToCarousel() {
    if (STATE.isTransitioning) return;
    STATE.isTransitioning = true;

    playMechanicalClick(110, 0.06);

    // Breve interferência ao sair
    triggerGlitch(300);

    setTimeout(() => {
      DOM.sectionOverlay?.classList.remove('is-active');
      DOM.sectionOverlay?.setAttribute('aria-hidden', 'true');
      STATE.activeSection = null;
      STATE.isTransitioning = false;

      // Restaura foco na fita central
      DOM.carouselCards[STATE.carouselIndex]?.focus();
    }, 180);
  }

  // --------------------------------------------------------------------------
  // 10. RELÓGIO DIGITAL & CONTADOR DE SESSÃO
  // --------------------------------------------------------------------------
  function initClock() {
    function update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      if (DOM.clockDisplay) {
        DOM.clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
      }
    }

    update();
    setInterval(update, 1000);
  }

  function initSessionTimer() {
    function update() {
      const elapsedSeconds = Math.floor((Date.now() - STATE.sessionStartTime) / 1000);
      const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsedSeconds % 60).padStart(2, '0');

      if (DOM.sessionDisplay) {
        DOM.sessionDisplay.textContent = `SESSION ${hours}:${minutes}:${seconds}`;
      }
    }

    update();
    setInterval(update, 1000);
  }

  // --------------------------------------------------------------------------
  // 11. UTILITÁRIOS ADICIONAIS (Cópia de E-mail)
  // --------------------------------------------------------------------------
  function initCopyEmail() {
    if (!DOM.copyEmailBtn) return;

    DOM.copyEmailBtn.addEventListener('click', async () => {
      const email = 'luccas.diazzi@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const originalText = DOM.copyEmailBtn.textContent;
        DOM.copyEmailBtn.textContent = '[ E-MAIL COPIADO! ]';
        DOM.copyEmailBtn.style.color = '#39ff14';

        setTimeout(() => {
          DOM.copyEmailBtn.textContent = originalText;
          DOM.copyEmailBtn.style.color = '';
        }, 2200);
      } catch {
        // Fallback em caso de bloqueio do clipboard
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 12. INICIALIZAÇÃO GERAL DO APLICATIVO
  // --------------------------------------------------------------------------
  function initializeApp() {
    // 1. Relógio e temporizador
    initClock();
    initSessionTimer();

    // 2. Animação de boot (DVD screensaver)
    initBootAnimation();

    // 3. Carrossel e seções
    initCarousel();

    // 4. Copiar e-mail e botões de retorno
    initCopyEmail();
    DOM.sectionBackBtn?.addEventListener('click', returnToCarousel);

    // Ajusta dimensões da animação de boot no redimensionamento da janela
    window.addEventListener('resize', () => {
      if (STATE.isBooting && DOM.dvdStage && DOM.ldLogo) {
        const bounds = DOM.dvdStage.getBoundingClientRect();
        dvdPos.x = Math.min(dvdPos.x, bounds.width - DOM.ldLogo.offsetWidth);
        dvdPos.y = Math.min(dvdPos.y, bounds.height - DOM.ldLogo.offsetHeight);
      }
    });
  }

  // Inicia após carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

})();
