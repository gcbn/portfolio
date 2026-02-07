# Portfolio (GitHub Pages)

Static portfolio site with project pages + blog.

## Structure

- `index.html` - landing page
- `projects/` - project pages
- `blog/` - devlog index + entries
- `partials/` - shared UI fragments (navbar/footer)
- `css/` - styles
- `js/` - navbar/theme logic
- `assets/` - icons, images, PDFs

## Theme

- Default theme is light.
- Toggle is in the navbar and persists via `localStorage`.

## HTML partials

`js/script.js` injects `partials/navbar.include` / `partials/footer.include` and falls back to `.html` if needed.
