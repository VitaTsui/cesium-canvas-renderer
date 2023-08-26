interface FontStyle {
  size?: string
  family?: string
  color?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
}

interface BorderStyle {
  color?: string
  width?: number
  radius?: Radius
}

type Padding = number | [number, number] | [number, number, number, number]

type Radius = number | [number, number, number, number]

/**
 * 计算字符串长度
 */
function get_string_width(str: string): number {
  let width = 0
  for (const char of str) {
    width += char.charCodeAt(0) < 128 && char.charCodeAt(0) >= 0 ? 1 : 1
  }

  return width
}

/**
 * 绘制画板
 */
interface DrawCtxOptions {
  ctx: CanvasRenderingContext2D
  backgroundColor?: string
  radius?: Radius
  width: number
  height: number
}
function drawCtx(options: DrawCtxOptions) {
  const { ctx, width, height, radius = 0, backgroundColor = '#ffffff00' } = options

  const PI = Math.PI

  const [x, y] = [0, 0]

  let [lt, rt, rb, lb] = [0, 0, 0, 0]
  if (Array.isArray(radius)) {
    ;[lt, rt, rb, lb] = radius
  } else {
    lt = radius
    lb = radius
    rt = radius
    rb = radius
  }

  // 左上圆角
  ctx.beginPath()
  ctx.arc(x + lt, y + lt, lt, PI, PI * 1.5)
  // 右上圆角
  ctx.lineTo(x + width - rt, y)
  ctx.arc(x + width - rt, y + rt, rt, PI * 1.5, 0)
  // 右下圆角
  ctx.lineTo(x + width, y + height - rb)
  ctx.arc(x + width - rb, y + height - rb, rb, 0, PI * 0.5)
  // 左下圆角
  ctx.lineTo(x + lb, y + height)
  ctx.arc(x + lb, y + height - lb, lb, PI * 0.5, PI)
  ctx.closePath()

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
}

/**
 * 绘制边框
 */
interface DrawBorderOptions {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  borderStyle?: BorderStyle
}
function drawBorder(options: DrawBorderOptions) {
  const { ctx, width, height, borderStyle = {} } = options
  const { color: borderColor = '#fff', width: borderWidth = 0, radius: borderRadius = 0 } = borderStyle
  const PI = Math.PI

  const [x, y] = [0, 0]

  let [lt, rt, rb, lb] = [0, 0, 0, 0]
  if (Array.isArray(borderRadius)) {
    ;[lt, rt, rb, lb] = borderRadius
  } else {
    lt = borderRadius
    lb = borderRadius
    rt = borderRadius
    rb = borderRadius
  }

  const path = new Path2D()
  path.moveTo(x + lt, y)
  path.lineTo(x + width - lt, y)
  path.arc(x + width - lt, y + lt, lt, PI * 1.5, 0, false)
  path.lineTo(x + width, y + height - lb)
  path.arc(x + width - lb, y + height - lb, lb, 0, PI * 0.5, false)
  path.lineTo(x + rt, y + height)
  path.arc(x + rt, y + height - rt, rt, PI * 0.5, PI, false)
  path.lineTo(x, y + rb)
  path.arc(x + rb, y + rb, rb, PI, PI * 1.5, false)

  ctx.lineWidth = borderWidth
  ctx.strokeStyle = borderColor
  ctx.stroke(path)
}

/**
 * 绘制文字
 */
interface DrawTextOptions {
  ctx: CanvasRenderingContext2D
  text: string | string[]
  fontStyle?: FontStyle
  top?: number
  left?: number
  rowGap?: number
}
function drawText(options: DrawTextOptions) {
  const { ctx, text, fontStyle = {}, top = 0, left = 0, rowGap = 0 } = options
  const {
    size: fontSize = '12px',
    family: fontFamily = '微软雅黑',
    color = '#000',
    textAlign = 'left',
    textBaseline = 'middle'
  } = fontStyle

  ctx.font = `${fontSize} ${fontFamily} `
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline
  if (Array.isArray(text)) {
    text.forEach((item, idx) => {
      const _matches = +(fontSize.match(/(\d+)/)?.[0] ?? '12')
      const _height = _matches * (idx + 1) + top + (idx !== 0 ? rowGap : 0)
      ctx.fillText(item, left, _height)
    })
  } else {
    ctx.fillText(text, left, top)
  }
}

/**
 * 绘制矩形 canvas
 */
export interface RectangleOptions {
  text: string | string[]
  borderStyle?: BorderStyle
  backgroundColor?: string
  fontStyle?: FontStyle
  padding?: Padding
  rowGap?: number
}
export default async function rectangle(options: RectangleOptions): Promise<HTMLCanvasElement | undefined> {
  const { text, borderStyle = {}, backgroundColor = '#ffffff00', fontStyle = {}, padding = 0, rowGap = 0 } = options
  const { radius: borderRadius = 0, width: borderWidth = 0 } = borderStyle
  const { size: fontSize = '12px' } = fontStyle

  if (Array.isArray(text)) {
    text.filter(Boolean)
  }
  if (!text || !text.length) return

  let [_top, _right, _bottom, _left] = [0, 0, 0, 0]
  if (Array.isArray(padding)) {
    if (padding.length === 2) {
      ;[_top, _bottom] = padding
      ;[_right, _left] = padding
    } else {
      ;[_top, _right, _bottom, _left] = padding
    }
  } else {
    _top = padding
    _right = padding
    _bottom = padding
    _left = padding
  }
  _top += borderWidth
  _right += borderWidth
  _bottom += borderWidth
  _left += borderWidth

  const _maxTextLength = Array.isArray(text)
    ? get_string_width(text.sort((a, b) => b.length - a.length)[0])
    : get_string_width(text)
  const _matches = +(fontSize.match(/(\d+)/)?.[0] ?? '12')
  let _rows = 1
  if (Array.isArray(text)) {
    _rows = text.length
  }
  const width = _maxTextLength * _matches + (_left + _right)
  const height = _rows * _matches + (_top + _bottom) + (_rows - 1) * rowGap

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = height

  drawCtx({ ctx, radius: borderRadius, width, height, backgroundColor })

  drawBorder({ ctx, width, height, borderStyle })

  drawText({ ctx, text, fontStyle, top: _top, left: _left, rowGap })

  return canvas
}
