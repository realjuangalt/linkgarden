(function () {
  const defaultData = {
    title: 'My Link Garden',
    description: 'A place to grow your links.',
    image: '',
    items: []
  };

  /** Default template (matches data(template).json) for Clear content when file not available. */
  const DEFAULT_TEMPLATE = {
    title: 'My Link Garden',
    description: 'A place to grow your links.',
    image: '',
    items: [
      { type: 'link', label: 'GitHub', url: 'https://github.com' },
      {
        type: 'page',
        label: 'Content',
        items: [
          { type: 'link', label: 'Articles', url: 'https://example.com/articles' },
          { type: 'link', label: 'Videos', url: 'https://youtube.com' },
          { type: 'link', label: 'Podcasts', url: 'https://example.com/podcasts' }
        ]
      },
      { type: 'link', label: 'Twitter', url: 'https://twitter.com' }
    ]
  };

  /** Static emoji set for the picker (no external lib). */
  const EMOJI_LIST = [
    '😀','😃','😄','😁','😅','😂','🤣','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😋','😜','🤪','😎','🤔','🙄','😏','😬','🤥','😌','😶','🙂','😐','😑','😯','😦','😧','😮','😲','😳','🥺','😢','😭','😤','😠','😡','🤬','😈','💀','💩','👍','👎','👏','🙌','👋','🤝','🙏','✌','🤞','🤟','🤘','👈','👉','👆','👇','❤','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','💖','💗','💘','⭐','✨','🔥','💯','🎯','🏆','📌','🎨','🎬','📰','🎵','🎶','🎙','🎤','📱','💻','🖥','📷','📸','🔗','📎','📖','📝','✏','🔒','🔑','💡','📢','🔔','🌱','🌿','🍀','🌸','🌺','🌻','🌼','🍁','🐸','➡','⬅','⬆','⬇','↗','↘','✔','✖','⚡','🔔','📣','💬','🗯','💭','🕐','📅','🗓','✅','🆗','🆒','🆕','🆓','🔝','🔙','🔛','🔜','🔃','🔄','⏩','⏪','🔀','🔁','🔂','💲','🅱','🅾','🅿','🈹','🈚','🈶','🈯','🈷','🈸','🈺','🉐','🉑','©','®','™','⚙','🔧','🛠','🔩','⛏','🪛','📐','📏','✂','🗃','🗄','🗑','🔒','🔓','🔏','🔐','🔑','🗝','🔨','🪓','⛏','🛡','🔫','🏹','🪃','🛡','🔮','🪄','📿','🧿','💈','⚗','🔭','🔬','🕳','🩻','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎','🔑','🗝','🚪','🪑','🛋','🛏','🛌','🧸','🪆','🖼','🪞','🪟','🛍','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉','📩','📨','📧','💌','📥','📤','📦','🪤','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒','🗓','📆','📅','🗑','📇','🗃','🗳','🗄','📋','📁','📂','🗂','🗞','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇','📐','📏','🧮','📌','📍','✂','🖊','🖋','✒','🖌','🖍','📝','💼','🗄','📁','📂','🗂','🗃','🗄','🗳','✏','🔏','🔒','🔓'
  ];

  let state = JSON.parse(JSON.stringify(defaultData));
  let addingMode = null;
  let addingParentItems = null;

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
  const clearContentBtn = document.getElementById('clear-content');
  const editorMessage = document.getElementById('editor-message');

  function resetToDefaultTemplate() {
    state = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
    if (!state.items) state.items = [];
    addingMode = null;
    addingParentItems = null;
    syncFromState();
    renderItems();
    updateJson();
    showMessage('Reset to default template.', false);
  }

  function fetchPreviewImage(url, callback) {
    if (!url || !url.trim() || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      if (callback) callback(null);
      return;
    }
    var apiUrl = 'https://api.microlink.io?url=' + encodeURIComponent(url.trim()) + '&screenshot=false';
    fetch(apiUrl).then(function (r) { return r.json(); }).then(function (json) {
      var img = (json && json.data && json.data.image && json.data.image.url) ? json.data.image.url : null;
      if (callback) callback(img);
    }).catch(function () { if (callback) callback(null); });
  }

  function showMessage(text, isError) {
    editorMessage.textContent = text;
    editorMessage.className = 'editor-message ' + (isError ? 'error' : '');
    editorMessage.hidden = false;
    if (text) setTimeout(function () { editorMessage.hidden = true; }, 5000);
  }

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

  function pushEditToState(form, item) {
    var labelIn = form.querySelector('input[type="text"]');
    if (labelIn) item.label = labelIn.value.trim() || (item.type === 'page' ? 'Untitled page' : 'Untitled link');
    if (item.type === 'link') {
      var urlIn = form.querySelector('input[type="url"]');
      if (urlIn) item.url = urlIn.value.trim() || '#';
      var thumbIn = form.querySelector('.thumb-url-input');
      var thumbVal = thumbIn ? thumbIn.value.trim() : '';
      item.thumbnail = thumbVal || undefined;
      if (!item.thumbnail) delete item.thumbnail;
      var thumbEmojiIn = form.querySelector('.thumb-emoji-input');
      var thumbEmojiVal = thumbEmojiIn ? thumbEmojiIn.value.trim() : '';
      item.thumbnailEmoji = thumbEmojiVal || undefined;
      if (!item.thumbnailEmoji) delete item.thumbnailEmoji;
    } else if (item.type === 'page') {
      var thumbInP = form.querySelector('.thumb-url-input');
      var thumbValP = thumbInP ? thumbInP.value.trim() : '';
      item.thumbnail = thumbValP || undefined;
      if (!item.thumbnail) delete item.thumbnail;
      var thumbEmojiInP = form.querySelector('.thumb-emoji-input');
      var thumbEmojiValP = thumbEmojiInP ? thumbEmojiInP.value.trim() : '';
      item.thumbnailEmoji = thumbEmojiValP || undefined;
      if (!item.thumbnailEmoji) delete item.thumbnailEmoji;
    }
    updateJson();
  }

  function makeEditForm(item, card, onSave) {
    const form = document.createElement('div');
    form.className = 'item-edit-form';
    const labelRow = document.createElement('div');
    labelRow.className = 'form-row';
    const labelLabel = document.createElement('label');
    labelLabel.textContent = item.type === 'page' ? 'Page label' : 'Label';
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = item.label || '';
    labelInput.placeholder = item.type === 'page' ? 'Page name' : 'Link text';
    labelInput.addEventListener('input', function () { pushEditToState(form, item); });
    labelRow.appendChild(labelLabel);
    labelRow.appendChild(labelInput);
    form.appendChild(labelRow);

    if (item.type === 'link') {
      const urlRow = document.createElement('div');
      urlRow.className = 'form-row';
      const urlLabel = document.createElement('label');
      urlLabel.textContent = 'URL';
      const urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.value = item.url || '';
      urlInput.placeholder = 'https://...';
      urlInput.addEventListener('input', function () { pushEditToState(form, item); });
      urlRow.appendChild(urlLabel);
      urlRow.appendChild(urlInput);
      form.appendChild(urlRow);

      const thumbRow = document.createElement('div');
      thumbRow.className = 'form-row form-row-thumb';
      const thumbLabel = document.createElement('label');
      thumbLabel.textContent = 'Image asset (overrides auto-pulled preview)';
      const thumbHint = document.createElement('span');
      thumbHint.className = 'form-hint';
      thumbHint.textContent = 'Optional. Use an image URL, Fetch preview, or pick an emoji to show in the same slot.';
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'thumb-input-wrap';
      const thumbInput = document.createElement('input');
      thumbInput.type = 'url';
      thumbInput.className = 'thumb-url-input';
      thumbInput.placeholder = 'https://... or use Fetch preview below';
      thumbInput.value = item.thumbnail || '';
      thumbInput.addEventListener('input', function () { pushEditToState(form, item); });
      const fetchBtn = document.createElement('button');
      fetchBtn.type = 'button';
      fetchBtn.className = 'btn btn-secondary btn-fetch-preview';
      fetchBtn.textContent = 'Fetch preview';
      fetchBtn.addEventListener('click', function () {
        var u = urlInput.value.trim();
        if (!u) { showMessage('Enter URL first.', true); return; }
        fetchBtn.disabled = true;
        fetchBtn.textContent = '…';
        fetchPreviewImage(u, function (imgUrl) {
          fetchBtn.disabled = false;
          fetchBtn.textContent = 'Fetch preview';
          if (imgUrl) { thumbInput.value = imgUrl; thumbEmojiDisplay.textContent = ''; thumbEmojiInput.value = ''; thumbEmojiClear.style.display = 'none'; thumbEmojiBtn.textContent = '😀'; pushEditToState(form, item); showMessage('Preview image found.', false); }
          else { showMessage('No preview image for this URL.', true); }
        });
      });
      thumbWrap.appendChild(thumbInput);
      thumbWrap.appendChild(fetchBtn);
      thumbRow.appendChild(thumbLabel);
      thumbRow.appendChild(thumbHint);
      thumbRow.appendChild(thumbWrap);
      var thumbEmojiWrap = document.createElement('div');
      thumbEmojiWrap.className = 'thumb-emoji-wrap';
      var thumbEmojiLabel = document.createElement('span');
      thumbEmojiLabel.className = 'form-hint';
      thumbEmojiLabel.textContent = 'Or use an emoji:';
      var thumbEmojiDisplay = document.createElement('span');
      thumbEmojiDisplay.className = 'thumb-emoji-display';
      thumbEmojiDisplay.textContent = item.thumbnailEmoji || '';
      thumbEmojiDisplay.setAttribute('aria-hidden', 'true');
      var thumbEmojiBtn = document.createElement('button');
      thumbEmojiBtn.type = 'button';
      thumbEmojiBtn.className = 'btn btn-secondary btn-emoji-asset';
      thumbEmojiBtn.title = 'Pick emoji as image asset';
      thumbEmojiBtn.textContent = item.thumbnailEmoji ? item.thumbnailEmoji : '😀';
      var thumbEmojiPicker = document.createElement('div');
      thumbEmojiPicker.className = 'emoji-picker emoji-picker-asset';
      thumbEmojiPicker.setAttribute('role', 'listbox');
      thumbEmojiPicker.setAttribute('aria-label', 'Choose emoji as image');
      var thumbEmojiInput = document.createElement('input');
      thumbEmojiInput.type = 'hidden';
      thumbEmojiInput.className = 'thumb-emoji-input';
      thumbEmojiInput.value = item.thumbnailEmoji || '';
      EMOJI_LIST.forEach(function (emoji) {
        var span = document.createElement('button');
        span.type = 'button';
        span.className = 'emoji-picker-item';
        span.textContent = emoji;
        span.setAttribute('role', 'option');
        span.addEventListener('click', function () {
          thumbEmojiInput.value = emoji;
          thumbEmojiDisplay.textContent = emoji;
          thumbEmojiBtn.textContent = emoji;
          thumbEmojiClear.style.display = 'inline-flex';
          thumbInput.value = '';
          thumbEmojiPicker.classList.remove('is-open');
          pushEditToState(form, item);
        });
        thumbEmojiPicker.appendChild(span);
      });
      thumbEmojiBtn.addEventListener('click', function () {
        thumbEmojiPicker.classList.toggle('is-open');
      });
      document.addEventListener('click', function closeAssetPicker(e) {
        if (thumbEmojiPicker.classList.contains('is-open') && !thumbEmojiPicker.contains(e.target) && e.target !== thumbEmojiBtn) {
          thumbEmojiPicker.classList.remove('is-open');
        }
      });
      var thumbEmojiClear = document.createElement('button');
      thumbEmojiClear.type = 'button';
      thumbEmojiClear.className = 'btn btn-secondary btn-emoji-clear';
      thumbEmojiClear.textContent = 'Clear emoji';
      thumbEmojiClear.style.display = item.thumbnailEmoji ? 'inline-flex' : 'none';
      thumbEmojiClear.addEventListener('click', function () {
        thumbEmojiInput.value = '';
        thumbEmojiDisplay.textContent = '';
        thumbEmojiBtn.textContent = '😀';
        thumbEmojiClear.style.display = 'none';
        pushEditToState(form, item);
      });
      thumbEmojiWrap.appendChild(thumbEmojiLabel);
      thumbEmojiWrap.appendChild(thumbEmojiDisplay);
      thumbEmojiWrap.appendChild(thumbEmojiBtn);
      thumbEmojiWrap.appendChild(thumbEmojiClear);
      thumbEmojiWrap.appendChild(thumbEmojiPicker);
      thumbEmojiWrap.appendChild(thumbEmojiInput);
      thumbRow.appendChild(thumbEmojiWrap);
      form.appendChild(thumbRow);
    }

    if (item.type === 'page') {
      const thumbRow = document.createElement('div');
      thumbRow.className = 'form-row form-row-thumb';
      const thumbLabel = document.createElement('label');
      thumbLabel.textContent = 'Image asset (emoji or image URL for this page)';
      const thumbHint = document.createElement('span');
      thumbHint.className = 'form-hint';
      thumbHint.textContent = 'Optional. Shown on the garden when opening this page.';
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'thumb-input-wrap';
      const thumbInput = document.createElement('input');
      thumbInput.type = 'url';
      thumbInput.className = 'thumb-url-input';
      thumbInput.placeholder = 'https://...';
      thumbInput.value = item.thumbnail || '';
      thumbInput.addEventListener('input', function () { pushEditToState(form, item); });
      thumbWrap.appendChild(thumbInput);
      thumbRow.appendChild(thumbLabel);
      thumbRow.appendChild(thumbHint);
      thumbRow.appendChild(thumbWrap);
      var thumbEmojiWrap = document.createElement('div');
      thumbEmojiWrap.className = 'thumb-emoji-wrap';
      var thumbEmojiLabel = document.createElement('span');
      thumbEmojiLabel.className = 'form-hint';
      thumbEmojiLabel.textContent = 'Or use an emoji:';
      var thumbEmojiDisplay = document.createElement('span');
      thumbEmojiDisplay.className = 'thumb-emoji-display';
      thumbEmojiDisplay.textContent = item.thumbnailEmoji || '';
      var thumbEmojiBtn = document.createElement('button');
      thumbEmojiBtn.type = 'button';
      thumbEmojiBtn.className = 'btn btn-secondary btn-emoji-asset';
      thumbEmojiBtn.title = 'Pick emoji as image asset';
      thumbEmojiBtn.textContent = item.thumbnailEmoji ? item.thumbnailEmoji : '😀';
      var thumbEmojiPicker = document.createElement('div');
      thumbEmojiPicker.className = 'emoji-picker emoji-picker-asset';
      thumbEmojiPicker.setAttribute('role', 'listbox');
      thumbEmojiPicker.setAttribute('aria-label', 'Choose emoji as image');
      var thumbEmojiInput = document.createElement('input');
      thumbEmojiInput.type = 'hidden';
      thumbEmojiInput.className = 'thumb-emoji-input';
      thumbEmojiInput.value = item.thumbnailEmoji || '';
      EMOJI_LIST.forEach(function (emoji) {
        var span = document.createElement('button');
        span.type = 'button';
        span.className = 'emoji-picker-item';
        span.textContent = emoji;
        span.setAttribute('role', 'option');
        span.addEventListener('click', function () {
          thumbEmojiInput.value = emoji;
          thumbEmojiDisplay.textContent = emoji;
          thumbEmojiBtn.textContent = emoji;
          thumbEmojiClear.style.display = 'inline-flex';
          thumbInput.value = '';
          thumbEmojiPicker.classList.remove('is-open');
          pushEditToState(form, item);
        });
        thumbEmojiPicker.appendChild(span);
      });
      thumbEmojiBtn.addEventListener('click', function () {
        thumbEmojiPicker.classList.toggle('is-open');
      });
      document.addEventListener('click', function closeAssetPicker(e) {
        if (thumbEmojiPicker.classList.contains('is-open') && !thumbEmojiPicker.contains(e.target) && e.target !== thumbEmojiBtn) {
          thumbEmojiPicker.classList.remove('is-open');
        }
      });
      var thumbEmojiClear = document.createElement('button');
      thumbEmojiClear.type = 'button';
      thumbEmojiClear.className = 'btn btn-secondary btn-emoji-clear';
      thumbEmojiClear.textContent = 'Clear emoji';
      thumbEmojiClear.style.display = item.thumbnailEmoji ? 'inline-flex' : 'none';
      thumbEmojiClear.addEventListener('click', function () {
        thumbEmojiInput.value = '';
        thumbEmojiDisplay.textContent = '';
        thumbEmojiBtn.textContent = '😀';
        thumbEmojiClear.style.display = 'none';
        pushEditToState(form, item);
      });
      thumbEmojiWrap.appendChild(thumbEmojiLabel);
      thumbEmojiWrap.appendChild(thumbEmojiDisplay);
      thumbEmojiWrap.appendChild(thumbEmojiBtn);
      thumbEmojiWrap.appendChild(thumbEmojiClear);
      thumbEmojiWrap.appendChild(thumbEmojiPicker);
      thumbEmojiWrap.appendChild(thumbEmojiInput);
      thumbRow.appendChild(thumbEmojiWrap);
      form.appendChild(thumbRow);
    }

    return form;
  }

  function makeNewItemForm(type, parentItems, onCancel) {
    const wrap = document.createElement('div');
    wrap.className = 'new-item-form';
    const heading = document.createElement('h3');
    heading.textContent = type === 'page' ? 'New page' : 'New link';
    wrap.appendChild(heading);

    const labelRowNew = document.createElement('div');
    labelRowNew.className = 'form-row';
    const labelLabelNew = document.createElement('label');
    labelLabelNew.textContent = type === 'page' ? 'Page label' : 'Label';
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = type === 'page' ? 'Page name' : 'Link text';
    labelRowNew.appendChild(labelLabelNew);
    labelRowNew.appendChild(labelInput);
    wrap.appendChild(labelRowNew);

    var urlInputNew = null;
    var thumbInputNew = null;
    var thumbEmojiInputNew = null;
    if (type === 'link') {
      const urlRow = document.createElement('div');
      urlRow.className = 'form-row';
      const urlLabel = document.createElement('label');
      urlLabel.textContent = 'URL';
      const urlIn = document.createElement('input');
      urlIn.type = 'url';
      urlIn.placeholder = 'https://...';
      urlInputNew = urlIn;
      urlRow.appendChild(urlLabel);
      urlRow.appendChild(urlIn);
      wrap.appendChild(urlRow);

      const thumbRow = document.createElement('div');
      thumbRow.className = 'form-row form-row-thumb';
      const thumbLabel = document.createElement('label');
      thumbLabel.textContent = 'Image asset (overrides auto-pulled preview)';
      const thumbHintNew = document.createElement('span');
      thumbHintNew.className = 'form-hint';
      thumbHintNew.textContent = 'Optional. Use an image URL, Fetch preview, or pick an emoji to show in the same slot.';
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'thumb-input-wrap';
      const thumbIn = document.createElement('input');
      thumbIn.type = 'url';
      thumbIn.className = 'thumb-url-input';
      thumbIn.placeholder = 'https://... or use Fetch preview below';
      thumbInputNew = thumbIn;
      const fetchBtn = document.createElement('button');
      fetchBtn.type = 'button';
      fetchBtn.className = 'btn btn-secondary btn-fetch-preview';
      fetchBtn.textContent = 'Fetch preview';
      fetchBtn.addEventListener('click', function () {
        var u = urlInputNew && urlInputNew.value.trim();
        if (!u) { showMessage('Enter URL first.', true); return; }
        fetchBtn.disabled = true;
        fetchBtn.textContent = '…';
        fetchPreviewImage(u, function (imgUrl) {
          fetchBtn.disabled = false;
          fetchBtn.textContent = 'Fetch preview';
          if (imgUrl) { thumbIn.value = imgUrl; thumbEmojiDispNew.textContent = ''; thumbEmojiInputNew.value = ''; thumbEmojiBtnNew.textContent = '😀'; thumbEmojiClearNew.style.display = 'none'; showMessage('Preview image found.', false); }
          else { showMessage('No preview image for this URL.', true); }
        });
      });
      thumbWrap.appendChild(thumbIn);
      thumbWrap.appendChild(fetchBtn);
      thumbRow.appendChild(thumbLabel);
      thumbRow.appendChild(thumbHintNew);
      thumbRow.appendChild(thumbWrap);
      var thumbEmojiWrapNew = document.createElement('div');
      thumbEmojiWrapNew.className = 'thumb-emoji-wrap';
      var thumbEmojiLabelNew = document.createElement('span');
      thumbEmojiLabelNew.className = 'form-hint';
      thumbEmojiLabelNew.textContent = 'Or use an emoji:';
      var thumbEmojiDispNew = document.createElement('span');
      thumbEmojiDispNew.className = 'thumb-emoji-display';
      var thumbEmojiBtnNew = document.createElement('button');
      thumbEmojiBtnNew.type = 'button';
      thumbEmojiBtnNew.className = 'btn btn-secondary btn-emoji-asset';
      thumbEmojiBtnNew.title = 'Pick emoji as image asset';
      thumbEmojiBtnNew.textContent = '😀';
      var thumbEmojiPickerNew = document.createElement('div');
      thumbEmojiPickerNew.className = 'emoji-picker emoji-picker-asset';
      thumbEmojiPickerNew.setAttribute('role', 'listbox');
      thumbEmojiPickerNew.setAttribute('aria-label', 'Choose emoji as image');
      thumbEmojiInputNew = document.createElement('input');
      thumbEmojiInputNew.type = 'hidden';
      thumbEmojiInputNew.className = 'thumb-emoji-input';
      EMOJI_LIST.forEach(function (emoji) {
        var span = document.createElement('button');
        span.type = 'button';
        span.className = 'emoji-picker-item';
        span.textContent = emoji;
        span.setAttribute('role', 'option');
        span.addEventListener('click', function () {
          thumbEmojiInputNew.value = emoji;
          thumbEmojiDispNew.textContent = emoji;
          thumbEmojiBtnNew.textContent = emoji;
          thumbEmojiClearNew.style.display = 'inline-flex';
          thumbIn.value = '';
          thumbEmojiPickerNew.classList.remove('is-open');
        });
        thumbEmojiPickerNew.appendChild(span);
      });
      thumbEmojiBtnNew.addEventListener('click', function () {
        thumbEmojiPickerNew.classList.toggle('is-open');
      });
      document.addEventListener('click', function closeAssetPickerNew(e) {
        if (thumbEmojiPickerNew.classList.contains('is-open') && !thumbEmojiPickerNew.contains(e.target) && e.target !== thumbEmojiBtnNew) {
          thumbEmojiPickerNew.classList.remove('is-open');
        }
      });
      var thumbEmojiClearNew = document.createElement('button');
      thumbEmojiClearNew.type = 'button';
      thumbEmojiClearNew.className = 'btn btn-secondary btn-emoji-clear';
      thumbEmojiClearNew.textContent = 'Clear emoji';
      thumbEmojiClearNew.style.display = 'none';
      thumbEmojiClearNew.addEventListener('click', function () {
        thumbEmojiInputNew.value = '';
        thumbEmojiDispNew.textContent = '';
        thumbEmojiBtnNew.textContent = '😀';
        thumbEmojiClearNew.style.display = 'none';
      });
      thumbEmojiWrapNew.appendChild(thumbEmojiLabelNew);
      thumbEmojiWrapNew.appendChild(thumbEmojiDispNew);
      thumbEmojiWrapNew.appendChild(thumbEmojiBtnNew);
      thumbEmojiWrapNew.appendChild(thumbEmojiClearNew);
      thumbEmojiWrapNew.appendChild(thumbEmojiPickerNew);
      thumbEmojiWrapNew.appendChild(thumbEmojiInputNew);
      thumbRow.appendChild(thumbEmojiWrapNew);
      wrap.appendChild(thumbRow);
    }

    const actions = document.createElement('div');
    actions.className = 'form-actions';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-primary';
    addBtn.textContent = 'Add';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    addBtn.addEventListener('click', function () {
      var label = labelInput.value.trim() || (type === 'page' ? 'Untitled page' : 'Untitled link');
      if (type === 'link') {
        var urlEl = urlInputNew;
        var urlVal = urlEl ? urlEl.value.trim() || '#' : '#';
        var thumbVal = thumbInputNew ? thumbInputNew.value.trim() : '';
        var thumbEmojiVal = thumbEmojiInputNew ? thumbEmojiInputNew.value.trim() : '';
        var newLink = { type: 'link', label: label, url: urlVal };
        if (thumbVal) newLink.thumbnail = thumbVal;
        if (thumbEmojiVal) newLink.thumbnailEmoji = thumbEmojiVal;
        parentItems.push(newLink);
      } else {
        parentItems.push({ type: 'page', label: label, items: [] });
      }
      addingMode = null;
      addingParentItems = null;
      syncToState();
      renderItems();
      updateJson();
    });
    cancelBtn.addEventListener('click', function () {
      addingMode = null;
      addingParentItems = null;
      renderItems();
      if (onCancel) onCancel();
    });
    actions.appendChild(addBtn);
    actions.appendChild(cancelBtn);
    wrap.appendChild(actions);
    return wrap;
  }

  function renderItem(item, index, parentItems, depth) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = String(index);

    const view = document.createElement('div');
    view.className = 'item-view';

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
    view.appendChild(head);

    if (item.type === 'link') {
      if (item.thumbnail && item.thumbnail.trim()) {
        const thumbPrev = document.createElement('img');
        thumbPrev.className = 'item-thumb-preview';
        thumbPrev.src = item.thumbnail;
        thumbPrev.alt = '';
        thumbPrev.onerror = function () { thumbPrev.style.display = 'none'; };
        view.appendChild(thumbPrev);
      } else if (item.thumbnailEmoji && item.thumbnailEmoji.trim()) {
        const thumbEmojiPrev = document.createElement('span');
        thumbEmojiPrev.className = 'item-thumb-preview item-thumb-preview-emoji';
        thumbEmojiPrev.textContent = item.thumbnailEmoji.trim();
        view.appendChild(thumbEmojiPrev);
      }
      const urlSpan = document.createElement('div');
      urlSpan.className = 'item-url';
      urlSpan.textContent = item.url || '—';
      view.appendChild(urlSpan);
    } else if (item.type === 'page') {
      if (item.thumbnail && item.thumbnail.trim()) {
        const thumbPrev = document.createElement('img');
        thumbPrev.className = 'item-thumb-preview';
        thumbPrev.src = item.thumbnail;
        thumbPrev.alt = '';
        thumbPrev.onerror = function () { thumbPrev.style.display = 'none'; };
        view.appendChild(thumbPrev);
      } else if (item.thumbnailEmoji && item.thumbnailEmoji.trim()) {
        const thumbEmojiPrev = document.createElement('span');
        thumbEmojiPrev.className = 'item-thumb-preview item-thumb-preview-emoji';
        thumbEmojiPrev.textContent = item.thumbnailEmoji.trim();
        view.appendChild(thumbEmojiPrev);
      }
    }

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'btn btn-secondary btn-order';
    upBtn.title = 'Move up';
    upBtn.textContent = '↑';
    upBtn.disabled = index === 0;
    upBtn.addEventListener('click', function () {
      if (index <= 0) return;
      var prev = parentItems[index - 1];
      parentItems[index - 1] = parentItems[index];
      parentItems[index] = prev;
      syncToState();
      renderItems();
      updateJson();
    });

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'btn btn-secondary btn-order';
    downBtn.title = 'Move down';
    downBtn.textContent = '↓';
    downBtn.disabled = index === parentItems.length - 1;
    downBtn.addEventListener('click', function () {
      if (index >= parentItems.length - 1) return;
      var next = parentItems[index + 1];
      parentItems[index + 1] = parentItems[index];
      parentItems[index] = next;
      syncToState();
      renderItems();
      updateJson();
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      if (card.classList.contains('is-editing')) {
        card.classList.remove('is-editing');
        renderItems();
      } else {
        card.classList.add('is-editing');
      }
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

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(editBtn);
    actions.appendChild(removeBtn);
    view.appendChild(actions);
    card.appendChild(view);

    const editForm = makeEditForm(item, card, function () {
      syncToState();
      renderItems();
      updateJson();
    });
    card.appendChild(editForm);

    if (item.type === 'page') {
      if (!item.items) item.items = [];
      const nested = document.createElement('div');
      nested.className = 'nested-items';
      item.items.forEach(function (sub, subIndex) {
        nested.appendChild(renderItem(sub, subIndex, item.items, depth + 1));
      });
      if (addingMode && addingParentItems === item.items) {
        nested.appendChild(makeNewItemForm(addingMode, item.items, function () { renderItems(); }));
      }
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
        addingMode = 'link';
        addingParentItems = item.items;
        renderItems();
      });
      const addPageInPage = document.createElement('button');
      addPageInPage.type = 'button';
      addPageInPage.className = 'btn btn-secondary';
      addPageInPage.textContent = '+ Page here';
      addPageInPage.addEventListener('click', function () {
        addingMode = 'page';
        addingParentItems = item.items;
        renderItems();
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
    if (addingMode && addingParentItems === state.items) {
      itemsContainer.appendChild(makeNewItemForm(addingMode, state.items));
    }
  }

  function updateJson() {
    syncToState();
    jsonOutput.value = JSON.stringify(state, null, 2);
  }

  addLinkBtn.addEventListener('click', function () {
    addingMode = 'link';
    addingParentItems = state.items;
    if (!state.items) state.items = [];
    renderItems();
  });

  addPageBtn.addEventListener('click', function () {
    addingMode = 'page';
    addingParentItems = state.items;
    if (!state.items) state.items = [];
    renderItems();
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

  if (clearContentBtn) {
    clearContentBtn.addEventListener('click', function () {
      fetch('data(template).json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (d) {
          state = d;
          if (!state.items) state.items = [];
          addingMode = null;
          addingParentItems = null;
          syncFromState();
          renderItems();
          updateJson();
          showMessage('Reset to default template.', false);
        })
        .catch(function () {
          resetToDefaultTemplate();
        });
    });
  }

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
          showMessage('Loaded successfully.', false);
        } else {
          showMessage('Invalid format: expected object with "title" and "items".', true);
        }
      } catch (e) {
        showMessage('Invalid JSON: ' + e.message, true);
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
