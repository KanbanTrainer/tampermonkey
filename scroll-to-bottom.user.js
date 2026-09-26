// ==UserScript==
// @name         Scroll to Bottom Button
// @namespace    https://github.com/KanbanTrainer/tampermonkey
// @version      1.0.0
// @description  Adds a bottom-right button whenever the page is not scrolled to the bottom.
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/scroll-to-bottom.user.js
// @downloadURL  https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/scroll-to-bottom.user.js
// ==/UserScript==

(() => {
  'use strict';

  const BUTTON_ID = 'flyrev-scroll-to-bottom';
  const BOTTOM_THRESHOLD_PX = 10;

  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = '↓';
  button.title = 'Scroll to bottom';
  button.setAttribute('aria-label', 'Scroll to bottom');

  Object.assign(button.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '48px',
    height: '48px',
    border: 'none',
    borderRadius: '50%',
    background: 'rgba(32, 33, 36, 0.92)',
    color: '#fff',
    fontSize: '28px',
    lineHeight: '48px',
    textAlign: 'center',
    cursor: 'pointer',
    zIndex: '2147483647',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.35)',
    opacity: '0',
    pointerEvents: 'none',
    transform: 'translateY(8px)',
    transition: 'opacity 120ms ease, transform 120ms ease',
  });

  const updateButton = () => {
    const scrollingElement = document.scrollingElement;
    if (!scrollingElement) return;

    const distanceFromBottom =
      scrollingElement.scrollHeight -
      scrollingElement.scrollTop -
      scrollingElement.clientHeight;

    const shouldShow = distanceFromBottom > BOTTOM_THRESHOLD_PX;

    button.style.opacity = shouldShow ? '1' : '0';
    button.style.pointerEvents = shouldShow ? 'auto' : 'none';
    button.style.transform = shouldShow ? 'translateY(0)' : 'translateY(8px)';
  };

  button.addEventListener('click', () => {
    const scrollingElement = document.scrollingElement;
    if (!scrollingElement) return;

    scrollingElement.scrollTo({
      top: scrollingElement.scrollHeight,
      behavior: 'smooth',
    });
  });

  document.body.appendChild(button);

  window.addEventListener('scroll', updateButton, { passive: true });
  window.addEventListener('resize', updateButton);

  const observer = new MutationObserver(updateButton);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  updateButton();
})();
