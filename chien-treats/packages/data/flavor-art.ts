export function generateFlavorArt(label: string, hex: string, w = 640, h = 480) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
    <defs>
      <radialGradient id='g' cx='50%' cy='40%'>
        <stop offset='0%' stop-color='${hex}' stop-opacity='0.9'/>
        <stop offset='100%' stop-color='${hex}' stop-opacity='0.4'/>
      </radialGradient>
      <pattern id='sprinkles' width='24' height='24' patternUnits='userSpaceOnUse'>
        <rect width='24' height='24' fill='transparent'/>
        <rect x='4' y='4' width='4' height='12' rx='2' fill='rgba(255,255,255,0.65)' transform='rotate(18 6 10)' />
        <rect x='14' y='8' width='4' height='10' rx='2' fill='rgba(255,255,255,0.55)' transform='rotate(-22 16 13)' />
      </pattern>
    </defs>
    <rect rx='24' ry='24' x='0' y='0' width='100%' height='100%' fill='url(#g)'/>
    <rect rx='24' ry='24' x='24' y='24' width='${w - 48}' height='${h - 48}' fill='url(#sprinkles)' opacity='.45'/>
    <g font-family='Nunito, sans-serif' font-size='48' font-weight='700' fill='rgba(0,0,0,.6)'>
      <text x='50%' y='54%' text-anchor='middle'>${label}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
