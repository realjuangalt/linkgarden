(function () {
  const defaultData = {
    title: 'My Link Garden',
    description: 'A place to grow your links.',
    image: '',
    items: []
  };

  let state = JSON.parse(JSON.stringify(defaultData));

  const gardenTitle = document.getElementById('garden-title');
  const gardenDescription = document.getElementById('garden-description');
  const gardenImage = document.getElementById('garden-image');
  const itemsContainer = document.getElementById('items-container');
  const addLinkBtn = document.getElementById('add-link');
  const addPageBtn = document.getElementById('add-page');
  const jsonOutput = document.getElementById('json-output');
  const copyBtn = document.getElementById('copy-json');
  const downloadBtn = document.getElementById('download-json');
  const loadInput = document.getElementById('load-json');

  function syncFromState() {
    gardenTitle.value = state.title || '';
    gardenDescription.value = state.description || '';
    gardenImage.value = state.image || '';
  }

  function syncToState() {
    state.title = gardenTitle.value.trim() || defaultData.title;
    state.description = gardenDescription.value.trim() || '';
    state.image = gardenImage.value.trim() || '';
  }

  function renderItem(item, index, parentItems, depth) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = String(index);

    const typeSpan = document.createElement('span');
    typeSpan.className = 'item-type';
    typeSpan.textContent = item.type === 'page' ? 'Page' : 'Link';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'item-label';
    labelSpan.textContent = item.label || (item.type === 'page' ? 'Untitled page' : 'Untitled link');

    const head = document.createElement('div');
    head.className = 'item-head';
    head.appendChild(typeSpan);
    head.appendChild(labelSpan);
    card.appendChild(head);

    if (item.type === 'link') {
      const urlSpan = document.createElement('div');
      urlSpan.className = 'item-url';
      urlSpan.textContent = item.url || '—';
      card.appendChild(urlSpan);
    }

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      if (item.type === 'link') {
        const label = prompt('Label', item.label);
        if (label !== null) item.label = label;
        const url = prompt('URL', item.url);
        if (url !== null) item.url = url;
      } else {
        const label = prompt('Page label', item.label);
        if (label !== null) item.label = label;
      }
      syncToState();
      renderItems();
      updateJson();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-danger';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function () {
      parentItems.splice(index, 1);
      syncToState();
      renderItems();
      updateJson();
    });

    actions.appendChild(editBtn);
    actions.appendChild(removeBtn);
    card.appendChild(actions);

    if (item.type === 'page') {
      if (!item.items) item.items = [];
      const nested = document.createElement('div');
      nested.className = 'nested-items';
      item.items.forEach(function (sub, subIndex) {
        nested.appendChild(renderItem(sub, subIndex, item.items, depth + 1));
      });
      const addInPage = document.createElement('div');
      addInPage.style.marginTop = '0.5rem';
      addInPage.style.display = 'flex';
      addInPage.style.gap = '0.5rem';
      addInPage.style.flexWrap = 'wrap';
      const addLinkInPage = document.createElement('button');
      addLinkInPage.type = 'button';
      addLinkInPage.className = 'btn btn-secondary';
      addLinkInPage.textContent = '+ Link here';
      addLinkInPage.addEventListener('click', function () {
        const label = prompt('Link label', 'New link');
        if (label === null) return;
        const url = prompt('URL', 'https://');
        if (url === null) return;
        item.items.push({ type: 'link', label: label || 'Link', url: url || '#' });
        syncToState();
        renderItems();
        updateJson();
      });
      const addPageInPage = document.createElement('button');
      addPageInPage.type = 'button';
      addPageInPage.className = 'btn btn-secondary';
      addPageInPage.textContent = '+ Page here';
      addPageInPage.addEventListener('click', function () {
        const label = prompt('Page label', 'New page');
        if (label === null) return;
        item.items.push({ type: 'page', label: label || 'Page', items: [] });
        syncToState();
        renderItems();
        updateJson();
      });
      addInPage.appendChild(addLinkInPage);
      addInPage.appendChild(addPageInPage);
      nested.appendChild(addInPage);
      card.appendChild(nested);
    }

    return card;
  }

  function renderItems() {
    itemsContainer.innerHTML = '';
    (state.items || []).forEach(function (item, index) {
      itemsContainer.appendChild(renderItem(item, index, state.items, 0));
    });
  }

  function updateJson() {
    syncToState();
    jsonOutput.value = JSON.stringify(state, null, 2);
  }

  addLinkBtn.addEventListener('click', function () {
    const label = prompt('Link label', 'New link');
    if (label === null) return;
    const url = prompt('URL', 'https://');
    if (url === null) return;
    if (!state.items) state.items = [];
    state.items.push({ type: 'link', label: label || 'Link', url: url || '#' });
    syncFromState();
    renderItems();
    updateJson();
  });

  addPageBtn.addEventListener('click', function () {
    const label = prompt('Page label', 'New page');
    if (label === null) return;
    if (!state.items) state.items = [];
    state.items.push({ type: 'page', label: label || 'Page', items: [] });
    syncFromState();
    renderItems();
    updateJson();
  });

  copyBtn.addEventListener('click', function () {
    jsonOutput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(function () { copyBtn.textContent = 'Copy JSON'; }, 1500);
  });

  downloadBtn.addEventListener('click', function () {
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  loadInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && (Array.isArray(parsed.items) || parsed.title != null)) {
          state = parsed;
          if (!state.items) state.items = [];
          syncFromState();
          renderItems();
          updateJson();
        } else {
          alert('Invalid format: expected object with "title" and "items".');
        }
      } catch (e) {
        alert('Invalid JSON: ' + e.message);
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  function loadFromDataJson() {
    fetch('data.json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        state = d;
        if (!state.items) state.items = [];
        syncFromState();
        renderItems();
        updateJson();
      })
      .catch(function () {
        syncFromState();
        renderItems();
        updateJson();
      });
  }

  loadFromDataJson();
})();
