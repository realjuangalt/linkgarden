# Link Garden

A minimal Link Tree–style link-in-bio page you can host for free on GitHub Pages. Links can point to external URLs or to **nested pages** (sub-gardens) of more links.

## Pages

- **Garden (home)** — `index.html`  
  Shows your title, description, optional avatar, and links. Click a “page” link to open a sub-page of links; use **Back** to return.  
  Link to edit: **Edit in Dashboard** at the bottom.

- **Dashboard (editor)** — `editor.html`  
  Edit title, description, avatar URL, and add/remove/reorder **links** (external URL) or **pages** (nested links).  
  Use **+ Link here** / **+ Page here** inside a page to add nested items.  
  **JSON output**: Copy or **Download data.json**, then replace the repo’s `data.json` with it.  
  **Load from file**: Load an existing `data.json` to edit it.  
  **View Garden** opens the main page.

## Data format (`data.json`)

```json
{
  "title": "My Link Garden",
  "description": "Optional short description.",
  "image": "https://example.com/avatar.jpg",
  "items": [
    { "type": "link", "label": "GitHub", "url": "https://github.com" },
    {
      "type": "page",
      "label": "Content",
      "items": [
        { "type": "link", "label": "Articles", "url": "https://..." },
        { "type": "link", "label": "Videos", "url": "https://..." }
      ]
    }
  ]
}
```

- **link** — opens `url` (in same tab; add `http`/`https` for external).
- **page** — shows a sub-page of `items` (can contain more links and pages).

## Host on GitHub Pages

1. Create a repo and push this folder (or enable Pages on an existing repo).
2. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` (or `master`) → folder: **/ (root)**.
3. Your garden will be at `https://<username>.github.io/<repo>/` (e.g. `https://user.github.io/link-garden/`).
4. To change links: use the Dashboard, download `data.json`, then commit and push the new `data.json` into the repo.

No server or build step — just HTML, CSS, and JavaScript.
