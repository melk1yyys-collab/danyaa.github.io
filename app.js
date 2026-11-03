(() => {
  'use strict';
  const config = window.PORTFOLIO_CONFIG || {};
  const name = typeof config.displayName === 'string' && config.displayName.trim() ? config.displayName.trim() : 'danya';
  document.querySelectorAll('[data-display-name]').forEach(el => { el.textContent = name; });
  document.title = `${name} / Контакты`;
  document.querySelector('meta[name="description"]').content = `Контакты ${name}. Discord, Telegram, VK и Steam на одной странице.`;
  const hosts = { telegram: ['t.me'], vk: ['vk.com', 'vk.ru'], steam: ['steamcommunity.com'] };
  const paths = { telegram: /^\/[A-Za-z][A-Za-z0-9_]{4,31}\/?$/, vk: /^\/[A-Za-z0-9_.-]{1,80}\/?$/, steam: /^\/(?:profiles\/[0-9]{17}|id\/[A-Za-z0-9_-]{1,64})\/?$/ };
  function arrow(copy = false) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'arrow-icon');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', copy ? 'M9 5H5V19H15V15M9 5V15H19V5Z' : 'M5 19L19 5M5 5H19V19');
    svg.append(path);
    return svg;
  }
  async function copyNickname(text) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  const manual = document.querySelector('#manual-copy');
  const nickname = document.querySelector('#discord-nickname');
  document.querySelector('#close-copy').addEventListener('click', () => {
    manual.hidden = true;
    document.querySelector('[data-contact="discord"] button')?.focus();
  });
  nickname.addEventListener('click', () => nickname.select());
  document.querySelectorAll('[data-contact]').forEach(card => {
    const key = card.dataset.contact;
    const contact = config.contacts?.[key];
    if (!contact) return;
    const value = card.querySelector('.contact-value');
    let action;
    if (key === 'discord') {
      if (typeof contact.username !== 'string' || !/^[a-z0-9_.]{2,32}$/.test(contact.username) || contact.username.includes('..')) return;
      value.textContent = contact.username;
      action = document.createElement('button');
      action.type = 'button';
      action.append(document.createTextNode('Скопировать ник'), arrow(true));
      action.addEventListener('click', async () => {
        const copied = await copyNickname(contact.username);
        const note = document.querySelector('.contact-note');
        note.textContent = copied ? `Ник ${contact.username} скопирован.` : 'Браузер не разрешил копирование. Ник можно скопировать из поля ниже.';
        manual.hidden = copied;
        if (!copied) {
          nickname.value = contact.username;
          nickname.focus();
          nickname.select();
        }
      });
    } else {
      let url;
      if (typeof contact.url !== 'string' || contact.url.length > 256 || /[\s\\]/.test(contact.url)) return;
      try { url = new URL(contact.url); } catch { return; }
      const path = url.pathname.replace(/\/+$/, '');
      if (url.protocol !== 'https:' || !hosts[key]?.includes(url.hostname.toLowerCase()) || !paths[key]?.test(url.pathname) || url.username || url.password || url.port || url.search || url.hash) return;
      value.textContent = typeof contact.label === 'string' && contact.label.trim() ? contact.label.trim() : url.hostname + path;
      const address = document.createElement('small');
      address.className = 'contact-address';
      address.textContent = url.hostname + url.pathname;
      value.append(address);
      action = document.createElement('a');
      action.href = url.href;
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
      action.setAttribute('aria-label', `Открыть ${card.querySelector('h3').textContent} в новой вкладке`);
      action.append(document.createTextNode('Открыть профиль'), arrow());
    }
    action.className = 'contact-action';
    card.querySelector('.contact-action').replaceWith(action);
    card.classList.add('is-set');
  });
  document.querySelector('.contact-note').textContent = 'Discord можно скопировать. Остальные профили откроются в новой вкладке.';
})();
