import QRCode from 'qrcode'

interface QROpts {
  ecLevel?: 'L' | 'M' | 'Q' | 'H'
  marginModules?: number   // quiet zone in modules (default 4)
  ptPerModule?: number     // size of one module in EPS points
}

export function qrToEPS(value: string, opts: QROpts = {}) {
  const ec = opts.ecLevel ?? 'M'
  const qz = opts.marginModules ?? 4
  const pt = Math.max(1, Math.round(opts.ptPerModule ?? 10))

  const qr = QRCode.create(value, { errorCorrectionLevel: ec })
  const size = qr.modules.size
  const data = qr.modules.data // boolean[], length size*size

  const total = size + 2 * qz
  const epsW = total * pt
  const epsH = total * pt

  const at = (x: number, y: number) => data[y * size + x]

  const lines: string[] = []
  lines.push('%!PS-Adobe-3.0 EPSF-3.0')
  lines.push(`%%BoundingBox: 0 0 ${epsW} ${epsH}`)
  lines.push('%%LanguageLevel: 2')
  lines.push('%%Pages: 1')
  lines.push('%%EndComments')
  lines.push('gsave')
  // EPS coordinates: Y axis upward; flip to draw in usual orientation
  lines.push('1 -1 scale')
  lines.push(`0 -${epsH} translate`)
  // scale: 1 module = pt points
  lines.push(`${pt} ${pt} scale`)

  // background is white
  lines.push('1 setgray')
  lines.push(`newpath 0 0 moveto ${total} 0 rlineto 0 ${total} rlineto -${total} 0 rlineto closepath fill`)

  // black modules
  lines.push('0 setgray')
  for (let y = 0; y < size; y++) {
    let runStart = -1
    for (let x = 0; x < size; x++) {
      const black = at(x, y)
      const last = x === size - 1
      if (black && runStart === -1) runStart = x
      if ((!black || last) && runStart !== -1) {
        const end = black && last ? x + 1 : x
        const len = end - runStart
        const ex = runStart + qz
        const ey = y + qz
        lines.push(`newpath ${ex} ${ey} moveto ${len} 0 rlineto 0 1 rlineto -${len} 0 rlineto closepath fill`)
        runStart = -1
      }
    }
  }

  lines.push('grestore')
  lines.push('%%EOF')
  return lines.join('\n')
}
