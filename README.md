# directoriofaique (React + Vite + GitHub Pages)

URL final: https://ialfaique.github.io/directorio/
## Scripts
- `npm run dev` — local
- `npm run build` — producción
- `npm run deploy` — publica a GitHub Pages (rama gh-pages)

## Notas
- `vite.config.js` usa `base: '/directoriofaique/'`.
- Rutas de assets usan `import.meta.env.BASE_URL` (fetch del JSON y escudo).
- JSON: `public/directorio_autoridades.json` (generado desde tu Excel si se encontró).
