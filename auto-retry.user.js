// ==UserScript==
// @name         Auto Retry Buttons
// @namespace    https://github.com/KanbanTrainer/tampermonkey
// @version      1.0.0
// @description  Automatically clicks Retry or Try again buttons every 30 seconds, with a countdown and per-tab pause control.
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/auto-retry.user.js
// @downloadURL  https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/auto-retry.user.js
// ==/UserScript==

(() => {
  'use strict';

  const CHECK_INTERVAL_SECONDS = 30;
  const SESSION_DISABLED_KEY = 'tampermonkey-auto-retry-disabled';
  const RETRY_LABELS = new Set(['retry', 'try again']);

  let secondsRemaining = CHECK_INTERVAL_SECONDS;

  function isDisabled() {
    try {
      return sessionStorage.getItem(SESSION_DISABLED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function setDisabled(disabled) {
    try {
      if (disabled) {
        sessionStorage.setItem(SESSION_DISABLED_KEY, 'true');
      } else {
        sessionStorage.removeItem(SESSION_DISABLED_KEY);
      }
    } catch {
      // Keep the in-page control usable even when sessionStorage is unavailable.
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
      right: '20px',
      bottom: '88px',
      zIndex: '2147483647',
      padding: '10px 14px',
      borderRadius: '10px',
      background: 'rgba(25, 25, 25, 0.94)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(8px)',
      opacity: '0',
      transform: 'translateY(8px)',
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
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 200);
    }, 2500);
  }

  function createStatusControl() {
    const host = document.createElement('div');
    host.id = 'tampermonkey-auto-retry-control';
    Object.assign(host.style, {
      all: 'initial',
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: '2147483647',
    });

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .panel {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 12px;
          background: rgba(25, 25, 25, 0.92);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(10px);
          font: 500 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          white-space: nowrap;
        }
        .countdown {
          min-width: 92px;
          font-variant-numeric: tabular-nums;
        }
        label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          user-select: none;
        }
        input {
          margin: 0;
          accent-color: currentColor;
        }
      </style>
      <div class="panel">
        <span class="countdown" aria-live="polite"></span>
        <label>
          <input type="checkbox">
          Disable for this tab
        </label>
      </div>
    `;

    const countdown = shadow.querySelector('.countdown');
    const checkbox = shadow.querySelector('input');
    checkbox.checked = isDisabled();

    checkbox.addEventListener('change', () => {
      setDisabled(checkbox.checked);
      if (!checkbox.checked) {
        secondsRemaining = CHECK_INTERVAL_SECONDS;
      }
      updateStatus(countdown, checkbox.checked);
    });

    document.documentElement.appendChild(host);
    return { countdown, checkbox };
  }

  function updateStatus(countdown, disabled = isDisabled()) {
    countdown.textContent = disabled
      ? 'Auto-retry paused'
      : `Retry check in ${secondsRemaining}s`;
  }

  function clickRetryButtons() {
    const buttons = findRetryButtons();

    for (const button of buttons) {
      button.click();
    }

    if (buttons.length > 0) {
      showToast(
        buttons.length === 1
          ? 'Retried automatically'
          : `Retried ${buttons.length} automatically`
      );
    }
  }

  const { countdown, checkbox } = createStatusControl();
  updateStatus(countdown, checkbox.checked);

  setInterval(() => {
    const disabled = isDisabled();
    checkbox.checked = disabled;

    if (disabled) {
      updateStatus(countdown, true);
      return;
    }

    secondsRemaining -= 1;

    if (secondsRemaining <= 0) {
      clickRetryButtons();
      secondsRemaining = CHECK_INTERVAL_SECONDS;
    }

    updateStatus(countdown, false);
  }, 1000);
})();
