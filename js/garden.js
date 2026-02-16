(function () {
  const titleEl = document.getElementById('title');
  const descriptionEl = document.getElementById('description');
  const avatarEl = document.getElementById('avatar');
  const navEl = document.getElementById('nav');
  const backBtn = document.getElementById('backBtn');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const linksEl = document.getElementById('links');

  let data = null;
  let path = [];
  const THUMB_CACHE_KEY = 'linkgarden-thumb-cache';

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

  function getThumbnailForLink(item) {
    if (item.thumbnail && item.thumbnail.trim()) return item.thumbnail.trim();
    var url = (item.url || '').trim();
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) return null;
    try {
      var cache = JSON.parse(localStorage.getItem(THUMB_CACHE_KEY) || '{}');
      if (cache[url]) return cache[url];
    } catch (e) {}
    return null;
  }

  function setThumbnailCache(url, imageUrl) {
    try {
      var cache = JSON.parse(localStorage.getItem(THUMB_CACHE_KEY) || '{}');
      cache[url] = imageUrl;
      if (Object.keys(cache).length > 200) {
        var keys = Object.keys(cache);
        keys.slice(0, 50).forEach(function (k) { delete cache[k]; });
      }
      localStorage.setItem(THUMB_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function fetchThumbnail(url, callback) {
    if (!url || !callback) return;
    var apiUrl = 'https://api.microlink.io?url=' + encodeURIComponent(url) + '&screenshot=false';
    fetch(apiUrl).then(function (r) { return r.json(); }).then(function (json) {
      var img = (json && json.data && json.data.image && json.data.image.url) ? json.data.image.url : null;
      if (img) {
        setThumbnailCache(url, img);
        callback(img);
      } else {
        callback(null);
      }
    }).catch(function () { callback(null); });
  }

  /** Fallback when no OG image: use site favicon (Google's favicon service). */
  function getFaviconUrl(url) {
    if (!url || !url.trim()) return null;
    try {
      var a = document.createElement('a');
      a.href = url.trim();
      var host = a.hostname;
      if (!host) return null;
      return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=128';
    } catch (e) {
      return null;
    }
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

    /* Back button only on sub-pages; main page has nowhere to go back to */
    if (path.length === 0) {
      navEl.classList.remove('is-subpage');
      navEl.setAttribute('aria-hidden', 'true');
    } else {
      navEl.classList.add('is-subpage');
      navEl.setAttribute('aria-hidden', 'false');
      breadcrumbEl.textContent = getBreadcrumbLabels().join(' › ');
    }

    linksEl.innerHTML = '';
    if (!items || items.length === 0) {
      linksEl.innerHTML = '<p class="description" style="text-align:center;margin:1rem 0;">No links here yet.</p>';
      return;
    }

    items.forEach(function (item, index) {
      var a = document.createElement('a');
      a.className = 'garden-link';
      a.setAttribute('role', 'button');

      var textSpan = document.createElement('span');
      textSpan.className = 'garden-link-text';
      textSpan.textContent = item.label || (item.type === 'link' ? 'Link' : 'Page');

      if (item.type === 'link') {
        a.href = item.url || '#';
        a.classList.add('external');
        if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        var explicitThumbUrl = (item.thumbnail || '').trim();
        var thumbEmoji = (item.thumbnailEmoji || '').trim();
        var thumbUrl = getThumbnailForLink(item);
        var isExternal = item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'));
        var faviconUrl = isExternal ? getFaviconUrl(item.url) : null;

        if (explicitThumbUrl) {
          a.classList.add('has-thumb');
          var img = document.createElement('img');
          img.className = 'garden-link-thumb';
          img.alt = '';
          img.src = explicitThumbUrl;
          img.loading = 'lazy';
          img.onerror = function () { a.classList.remove('has-thumb'); };
          a.appendChild(img);
        } else if (thumbEmoji) {
          a.classList.add('has-thumb');
          var emojiSpan = document.createElement('span');
          emojiSpan.className = 'garden-link-thumb garden-link-thumb-emoji';
          emojiSpan.setAttribute('aria-hidden', 'true');
          emojiSpan.textContent = thumbEmoji;
          a.appendChild(emojiSpan);
        } else if (thumbUrl) {
          a.classList.add('has-thumb');
          var img = document.createElement('img');
          img.className = 'garden-link-thumb';
          img.alt = '';
          img.src = thumbUrl;
          img.loading = 'lazy';
          img.onerror = function () { a.classList.remove('has-thumb'); };
          a.appendChild(img);
        } else if (isExternal) {
          a.classList.add('has-thumb');
          var img = document.createElement('img');
          img.className = 'garden-link-thumb garden-link-thumb-favicon';
          img.alt = '';
          img.src = faviconUrl || '';
          img.loading = 'lazy';
          img.onerror = function () { a.classList.remove('has-thumb'); };
          a.appendChild(img);
          fetchThumbnail(item.url, function (ogUrl) {
            if (ogUrl && img.parentNode) {
              setThumbnailCache(item.url, ogUrl);
              img.src = ogUrl;
              img.classList.remove('garden-link-thumb-favicon');
            }
          });
        }
      } else if (item.type === 'page') {
        a.href = '#';
        a.classList.add('subpage');
        var pageThumbUrl = (item.thumbnail || '').trim();
        var pageThumbEmoji = (item.thumbnailEmoji || '').trim();
        if (pageThumbUrl) {
          a.classList.add('has-thumb');
          var pageImg = document.createElement('img');
          pageImg.className = 'garden-link-thumb';
          pageImg.alt = '';
          pageImg.src = pageThumbUrl;
          pageImg.loading = 'lazy';
          pageImg.onerror = function () { a.classList.remove('has-thumb'); };
          a.appendChild(pageImg);
        } else if (pageThumbEmoji) {
          a.classList.add('has-thumb');
          var pageEmojiSpan = document.createElement('span');
          pageEmojiSpan.className = 'garden-link-thumb garden-link-thumb-emoji';
          pageEmojiSpan.setAttribute('aria-hidden', 'true');
          pageEmojiSpan.textContent = pageThumbEmoji;
          a.appendChild(pageEmojiSpan);
        }
        a.addEventListener('click', function (e) {
          e.preventDefault();
          path.push(index);
          updateHash();
          render();
        });
      }

      a.appendChild(textSpan);
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
