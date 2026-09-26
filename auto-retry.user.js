// ==UserScript==
// @name         Retry Helper
// @namespace    https://github.com/KanbanTrainer/tampermonkey
// @version      2.0.0
// @description  Prompts before retrying Retry or Try again buttons, with optional continuous retry for the current tab.
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/auto-retry.user.js
// @downloadURL  https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/auto-retry.user.js
// ==/UserScript==

(() => {
  'use strict';

  const RETRY_INTERVAL_SECONDS = 30;
  const CONTINUOUS_RETRY_KEY = 'tampermonkey-retry-helper-continuous';
  const RETRY_LABELS = new Set(['retry', 'try again']);

  let retryWasPresent = false;
  let dismissedForCurrentAppearance = false;
  let secondsRemaining = RETRY_INTERVAL_SECONDS;

  function isContinuousRetryEnabled() {
    try {
      return sessionStorage.getItem(CONTINUOUS_RETRY_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function setContinuousRetryEnabled(enabled) {
    try {
      if (enabled) {
        sessionStorage.setItem(CONTINUOUS_RETRY_KEY, 'true');
      } else {
        sessionStorage.removeItem(CONTINUOUS_RETRY_KEY);
      }
    } catch {
      // Keep working even when sessionStorage is unavailable.
    }
  }

  function normalizedButtonText(button) {
    return (button.innerText || button.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function findRetryButtons() {
    return [...document.querySelectorAll('button')].filter(button =>
      !button.disabled &&
      button.getAttribute('aria-disabled') !== 'true' &&
      RETRY_LABELS.has(normalizedButtonText(button))
    );
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      right: '16px',
      bottom: '72px',
      zIndex: '2147483647',
      padding: '8px 11px',
      borderRadius: '9px',
      background: 'rgba(25, 25, 25, 0.94)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(8px)',
      opacity: '0',
      transform: 'translateY(6px)',
      transition: 'opacity 150ms ease, transform 150ms ease',
      pointerEvents: 'none',
    });

    document.documentElement.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => toast.remove(), 200);
    }, 2200);
  }

  function clickRetryButtons(buttons, message = 'Retried') {
    for (const button of buttons) {
      button.click();
    }

    if (buttons.length > 0) {
      showToast(buttons.length === 1 ? message : `${message} ${buttons.length} items`);
    }
  }

  function createControl() {
    const host = document.createElement('div');
    host.id = 'tampermonkey-retry-helper';
    Object.assign(host.style, {
      all: 'initial',
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: '2147483647',
      display: 'none',
    });

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }

        .panel {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 8px 7px 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          background: rgba(25, 25, 25, 0.94);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          font: 500 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          white-space: nowrap;
        }

        .message {
          margin-right: 2px;
          font-variant-numeric: tabular-nums;
        }

        button {
          appearance: none;
          border: 0;
          border-radius: 7px;
          padding: 5px 8px;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font: inherit;
          cursor: pointer;
        }

        button:hover {
          background: rgba(255, 255, 255, 0.20);
        }

        .primary {
          background: rgba(255, 255, 255, 0.20);
          font-weight: 650;
        }

        .close {
          padding: 3px 6px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          line-height: 1;
        }

        .close:hover {
          background: rgba(255, 255, 255, 0.10);
          color: #fff;
        }

        [hidden] {
          display: none !important;
        }
      </style>

      <div class="panel">
        <span class="message" aria-live="polite">Retry?</span>
        <button class="retry primary" type="button">Retry now</button>
        <button class="continuous" type="button">Keep retrying</button>
        <button class="close" type="button" aria-label="Dismiss retry helper" title="Dismiss">×</button>
      </div>
    `;

    const message = shadow.querySelector('.message');
    const retryButton = shadow.querySelector('.retry');
    const continuousButton = shadow.querySelector('.continuous');
    const closeButton = shadow.querySelector('.close');

    retryButton.addEventListener('click', () => {
      const buttons = findRetryButtons();
      clickRetryButtons(buttons);
      dismissedForCurrentAppearance = true;
      host.style.display = 'none';
    });

    continuousButton.addEventListener('click', () => {
      setContinuousRetryEnabled(true);
      secondsRemaining = RETRY_INTERVAL_SECONDS;
      const buttons = findRetryButtons();
      clickRetryButtons(buttons, 'Continuous retry enabled');
      render();
    });

    closeButton.addEventListener('click', () => {
      setContinuousRetryEnabled(false);
      dismissedForCurrentAppearance = true;
      secondsRemaining = RETRY_INTERVAL_SECONDS;
      host.style.display = 'none';
      showToast('Retry helper dismissed');
    });

    document.documentElement.appendChild(host);

    return {
      host,
      message,
      retryButton,
      continuousButton,
    };
  }

  const control = createControl();

  function render() {
    const buttons = findRetryButtons();
    const retryIsPresent = buttons.length > 0;

    if (!retryIsPresent) {
      retryWasPresent = false;
      dismissedForCurrentAppearance = false;
      secondsRemaining = RETRY_INTERVAL_SECONDS;
      control.host.style.display = 'none';
      return buttons;
    }

    if (!retryWasPresent) {
      retryWasPresent = true;
      dismissedForCurrentAppearance = false;
      secondsRemaining = RETRY_INTERVAL_SECONDS;
    }

    if (dismissedForCurrentAppearance) {
      control.host.style.display = 'none';
      return buttons;
    }

    const continuous = isContinuousRetryEnabled();

    control.host.style.display = 'block';
    control.retryButton.hidden = continuous;
    control.continuousButton.hidden = continuous;
    control.message.textContent = continuous
      ? `Retrying in ${secondsRemaining}s`
      : 'Retry?';

    return buttons;
  }

  const observer = new MutationObserver(render);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled'],
  });

  render();

  setInterval(() => {
    const buttons = render();

    if (buttons.length === 0 || !isContinuousRetryEnabled() || dismissedForCurrentAppearance) {
      return;
    }

    secondsRemaining -= 1;

    if (secondsRemaining <= 0) {
      clickRetryButtons(buttons, 'Retried automatically');
      secondsRemaining = RETRY_INTERVAL_SECONDS;
    }

    render();
  }, 1000);
})();
