# Python for AI Research Web Deck

This repo now includes an interactive web deck generated from `build.js`.

## Local preview

Requires Node.js 18+.

```bash
npm run build
npm run serve
```

Open:

```text
http://localhost:3100/python-ai/lesson-01/
```

On this Windows machine, Node is currently available through Adobe at:

```powershell
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" build.js
& "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" server.js
```

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds the deck on every push to `main`.

One-time repo setting:

```text
Settings -> Pages -> Source -> GitHub Actions
```

After the workflow runs, the course site should be available at:

```text
https://tedchai.github.io/Python-for-AI/
```

## Editing lessons

Edit `build.js`:

- `CATALOG` controls the home page and course list.
- `buildPythonClass01()` controls Class 01 slides.
- Add more lessons by creating another build function and registering it in `DECK_BUILDERS`.

The current Class 01 deck includes:

- title page with course overview image
- course roadmap and grading slides
- two in-slide quizzes
- two browser-based Python labs
- per-slide comments when served by `server.js`
