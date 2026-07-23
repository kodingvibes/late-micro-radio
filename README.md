# late-micro-radio

Microfront de la radio. Bundle ESM que el shell (`late-web-ui`) carga vía
`<script type="module">`. Publica `window.RadioEngine` y monta la UI en
`<div id="micro-radio-root">` cuando aparece en el DOM.

## Build local

```bash
npm install
npm run build
# dist/entry.js + dist/style.css → rsync a /var/www/html/micro/radio/vX.Y.Z/
```

## Contrato

Ver `src/global.d.ts`. Resumen: `getState()`, `subscribe(fn)`, `play/toggle/stop/setVolume/toggleMute`, `getAudioElement()`, `getAnalyser()`. Lista de streams en `window.RadioEngine.streams`.

## Dependencias

Solo React 18 + Tailwind 4 (para los estilos del componente page). React y ReactDOM están `external` — el shell los sirve desde `/vendor/`.
