(function () {
  const titleEl = document.getElementById('title');
  const descriptionEl = document.getElementById('description');
  const avatarEl = document.getElementById('avatar');
  const navEl = document.getElementById('nav');
  const backBtn = document.getElementById('backBtn');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const linksEl = document.getElementById('links');

  let data = null;
  let path = []; // stack of page indices: [1] = first page at root, [1, 0] = first item of that page

  /** Convert X/Twitter profile URLs to a direct avatar image URL so <img> can load it. */
  function avatarImageUrl(url) {
    if (!url || !url.trim()) return url;
    var match = url.match(/(?:x\.com|twitter\.com)\/([^\/\?]+)/i);
    if (match) {
      return 'https://unavatar.io/twitter/' + encodeURIComponent(match[1]);
    }
    return url;
  }

  function getCurrentItems() {
    if (!data || !data.items) return null;
    let items = data.items;
    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      if (!items[idx] || items[idx].type !== 'page') return null;
      items = items[idx].items || [];
    }
    return items;
  }

  function getBreadcrumbLabels() {
    const labels = [];
    let items = data.items;
    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      if (!items[idx]) break;
      labels.push(items[idx].label);
      if (items[idx].type === 'page') items = items[idx].items || [];
    }
    return labels;
  }

  function render() {
    const items = getCurrentItems();

    titleEl.textContent = data.title || 'Link Garden';
    if (data.description) {
      descriptionEl.textContent = data.description;
      descriptionEl.hidden = false;
    } else {
      descriptionEl.hidden = true;
    }
    if (data.image) {
      avatarEl.src = avatarImageUrl(data.image);
      avatarEl.alt = data.title || 'Avatar';
      avatarEl.hidden = false;
    } else {
      avatarEl.hidden = true;
    }

    if (path.length === 0) {
      navEl.hidden = true;
    } else {
      navEl.hidden = false;
      breadcrumbEl.textContent = getBreadcrumbLabels().join(' › ');
    }

    linksEl.innerHTML = '';
    if (!items || items.length === 0) {
      linksEl.innerHTML = '<p class="description" style="text-align:center;margin:1rem 0;">No links here yet.</p>';
      return;
    }

    items.forEach((item, index) => {
      const a = document.createElement('a');
      a.className = 'garden-link';
      a.setAttribute('role', 'button');

      if (item.type === 'link') {
        a.href = item.url || '#';
        a.textContent = item.label || 'Link';
        a.classList.add('external');
        if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      } else if (item.type === 'page') {
        a.href = '#';
        a.textContent = item.label || 'Page';
        a.classList.add('subpage');
        a.addEventListener('click', function (e) {
          e.preventDefault();
          path.push(index);
          updateHash();
          render();
        });
      }

      linksEl.appendChild(a);
    });
  }

  function updateHash() {
    const hash = path.length ? '#/' + path.join('/') : '#';
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  }

  function parseHash() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) {
      path = [];
      return;
    }
    path = hash.split('/').map(function (s) { return parseInt(s, 10); }).filter(function (n) { return !isNaN(n); });
  }

  backBtn.addEventListener('click', function () {
    if (path.length > 0) {
      path.pop();
      updateHash();
      render();
    }
  });

  window.addEventListener('hashchange', function () {
    parseHash();
    render();
  });

  function loadData() {
    return fetch('data.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Could not load data.json');
        return r.json();
      })
      .catch(function () {
        return {
          title: 'Link Garden',
          description: 'Add data.json or use the Dashboard to create your links.',
          items: []
        };
      });
  }

  loadData().then(function (d) {
    data = d;
    parseHash();
    render();
  });
})();
