# Link Garden

A minimal link list home page link-in-bio page you can host **for free** on GitHub Pages. No server or build step — just HTML, CSS, and JavaScript. Add your title, description, avatar, and links (or nested “pages” of links) and share one URL.

---

## How to use this page

### Viewing your garden

- Open **`index.html`** in a browser (or your live GitHub Pages URL).  
- You’ll see your **title**, **description**, optional **avatar image**, and **link cards**.  
- Click a **link** to go to that URL. Click a **page** to open a sub-page of more links; use **Back** to return.  
- At the bottom: **Edit in Dashboard** (takes you to the editor) and **GitHub** (repo link).

### Editing your links (Dashboard)

1. Open **`editor.html`** (or **Your-Site → Edit in Dashboard**).
2. **Garden details:** Edit **Title**, **Description (optional)**, and **Avatar image URL (optional)**.
3. **Links & pages:**  
   - **+ Add link** — add a link (label + URL).  
   - **+ Add page** — add a nested page (label + its own list of links/pages).  
   - On each card: **Edit** to change label, URL, or optional **image/emoji**; **Up** / **Down** to reorder; **Remove** to delete.  
   - Inside a page, use **+ Link here** / **+ Page here** to add nested items.
4. **JSON output:**  
   - Copy or **Download data.json**, then replace the repo’s `data.json` with it and commit/push, **or**  
   - **Load from file** to open an existing `data.json`, edit, then copy/download again.
5. **View Garden** — open the main page to preview.

---

## Adding links via the JSON file

You can edit **`data.json`** directly (in the repo or after downloading from the Dashboard) to add or change links and pages.

### Data format (`data.json`)

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Main heading on the garden page. |
| `description` | No | Short text under the title. |
| `image` | No | Avatar image URL (e.g. profile picture). |
| `items` | Yes | Array of links and/or pages. |

### Item types

**Link** — one label + URL:

```json
{
  "type": "link",
  "label": "My Blog",
  "url": "https://example.com",
  "thumbnail": "https://example.com/icon.png",
  "thumbnailEmoji": "📝"
}
```

- `thumbnail`: optional image URL for the card.  
- `thumbnailEmoji`: optional emoji for the card (used if no `thumbnail`).

**Page** — nested set of links/pages:

```json
{
  "type": "page",
  "label": "More links",
  "items": [
    { "type": "link", "label": "One", "url": "https://one.com" },
    { "type": "link", "label": "Two", "url": "https://two.com" }
  ],
  "thumbnail": "https://...",
  "thumbnailEmoji": "📂"
}
```

- `items`: array of more links and pages (can nest).  
- `thumbnail` / `thumbnailEmoji`: optional, same as for links.

### Full example

```json
{
  "title": "My Link Garden",
  "description": "Optional short description.",
  "image": "https://example.com/avatar.jpg",
  "items": [
    { "type": "link", "label": "GitHub", "url": "https://github.com", "thumbnailEmoji": "🐙" },
    {
      "type": "page",
      "label": "Content",
      "thumbnailEmoji": "📂",
      "items": [
        { "type": "link", "label": "Articles", "url": "https://example.com/articles" },
        { "type": "link", "label": "Videos", "url": "https://youtube.com" }
      ]
    }
  ]
}
```

Save as **`data.json`** in the same folder as `index.html` (and replace the repo file if you’re hosting on GitHub).

---

## Setting it up on GitHub Pages (free)

1. **Create a repository** (or use an existing one) and push this folder (all files: `index.html`, `editor.html`, `data.json`, `css/`, `js/`, etc.).

2. **Turn on GitHub Pages:**  
   - Repo → **Settings** → in the sidebar, **Pages** (under “Code and automation”).  
   - Under **Build and deployment**, **Source**: choose **Deploy from a branch**.  
   - **Branch**: e.g. `main` (or `master`) — **/(root)**.  
   - Save.

3. **Your site** will be at:  
   `https://<username>.github.io/<repo>/`  
   (e.g. `https://realjuangalt.github.io/linkgarden/`).

4. **Update links:** Use the Dashboard (`editor.html`) to edit, then copy or download `data.json`, commit and push it to the same repo. The site updates after the next Pages deploy.

### Official GitHub documentation

- [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)  
- [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)  
- [Quickstart for GitHub Pages](https://docs.github.com/en/pages/quickstart)

### Custom domain (e.g. yourdomain.com)

- In the repo: **Settings → Pages** → **Custom domain** → enter your domain (e.g. `juangalt.com`) and save.  
- Add a **CNAME** file in the repo root with one line: your domain (e.g. `juangalt.com`).  
- At your DNS provider, add the records GitHub shows (usually A records for apex, CNAME for `www`).  
- After DNS propagates, GitHub will provision HTTPS. Then enable **Enforce HTTPS** in Pages settings.

Docs:

- [Configuring a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)  
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

---

## Files in this repo

| File / folder | Purpose |
|---------------|---------|
| `index.html` | Public garden page (what visitors see). |
| `editor.html` | Dashboard to edit title, description, avatar, links, and pages. |
| `data.json` | Your content (title, description, image, items). Edit here or via the Dashboard. |
| `data(template).json` | Optional template for “Clear content” in the Dashboard. |
| `css/style.css` | Styles for garden and editor. |
| `js/garden.js` | Garden logic (loads `data.json`, renders links and pages). |
| `js/editor.js` | Editor logic (forms, JSON output, copy/download). |
