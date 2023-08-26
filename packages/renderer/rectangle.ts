import { deepCopy } from 'hsu-utils'

interface FontStyle {
  style?: string
  variant?: string
  weight?: string
  size?: number
  lineHeight?: number
  family?: string
  color?: string
  padding?: Padding
  rowGap?: number
  textAlign?: 'left' | 'center' | 'right'
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
    width += char.charCodeAt(0) < 128 && char.charCodeAt(0) >= 0 ? 0.5 : 1
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
    ;[lt, rt, rb, lb] = [radius, radius, radius, radius]
  }

  // 左上圆角
  if (lt) {
    ctx.arc(x + lt, y + lt, lt, PI, PI * 1.5)
  } else {
    ctx.moveTo(x, y)
  }
  // 右上圆角
  if (rt) {
    ctx.lineTo(x + width - rt, y)
    ctx.arc(x + width - rt, y + rt, rt, PI * 1.5, 0)
  } else {
    ctx.lineTo(x + width, y)
  }
  // 右下圆角
  if (rb) {
    ctx.lineTo(x + width, y + height - rb)
    ctx.arc(x + width - rb, y + height - rb, rb, 0, PI * 0.5)
  } else {
    ctx.lineTo(x + width, y + height)
  }
  // 左下圆角
  if (lb) {
    ctx.lineTo(x + lb, y + height)
    ctx.arc(x + lb, y + height - lb, lb, PI * 0.5, PI)
  } else {
    ctx.lineTo(x, y + height)
  }
  ctx.clip()

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
  const { color: borderColor = '#fff', width: borderWidth = 1, radius: borderRadius = 0 } = borderStyle

  if (!borderWidth) {
    return
  }

  const [x, y] = [0, 0]

  let [lt, rt, rb, lb] = [0, 0, 0, 0]
  if (Array.isArray(borderRadius)) {
    ;[lt, rt, rb, lb] = borderRadius
  } else {
    ;[lt, rt, rb, lb] = [borderRadius, borderRadius, borderRadius, borderRadius]
  }

  const path = new Path2D()
  const PI = Math.PI
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
  const { ctx, text, fontStyle: _fontStyle = {}, top = 0, left = 0, rowGap = 0 } = options
  const {
    color = '#000',
    textAlign = 'left',
    style: fontStyle = 'normal',
    variant: fontVariant = 'normal',
    weight: fontWeight = 'normal',
    size: fontSize = 12,
    lineHeight = 1,
    family: fontFamily = '微软雅黑'
  } = _fontStyle

  ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px/${lineHeight} ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  ctx.textBaseline = 'middle'

  const _maxTextLength = Array.isArray(text)
    ? get_string_width(deepCopy(text).sort((a, b) => b.length - a.length)[0])
    : get_string_width(text)
  const textLenth = _maxTextLength * fontSize

  let [_left, _top] = [left, top]
  if (textAlign === 'center') {
    _left += textLenth / 2
  }
  if (textAlign === 'right') {
    _left += textLenth
  }
  _top += fontSize / 2

  if (Array.isArray(text)) {
    text.forEach((item, idx) => {
      const _height = fontSize * idx + _top + rowGap * idx
      ctx.fillText(item, _left, _height)
    })
  } else {
    ctx.fillText(text, _left, _top)
  }
}

/**
 * 绘制矩形 canvas
 */
export interface RectangleOptions {
  content?: string | string[]
  borderStyle?: BorderStyle
  backgroundColor?: string
  fontStyle?: FontStyle
  width?: number | 'auto'
  height?: number | 'auto'
}
export default function rectangle(options: RectangleOptions): HTMLCanvasElement {
  const {
    content,
    borderStyle = {},
    backgroundColor = '#ffffff00',
    fontStyle = {},
    width: canvasWidth = 'auto',
    height: canvasHeight = 'auto'
  } = options
  const { radius: borderRadius = 0, width: borderWidth = 1 } = borderStyle
  const { size: fontSize = 12, padding = 0, rowGap = 0 } = fontStyle

  let [_top, _right, _bottom, _left] = [0, 0, 0, 0]
  if (Array.isArray(padding)) {
    if (padding.length === 2) {
      ;[_top, _left] = padding
      ;[_bottom, _right] = padding
    } else {
      ;[_top, _right, _bottom, _left] = padding
    }
  } else {
    ;[_top, _right, _bottom, _left] = [padding, padding, padding, padding]
  }
  if (borderWidth) {
    _top += borderWidth
    _right += borderWidth
    _bottom += borderWidth
    _left += borderWidth
  }

  let [width, height] = [0, 0]
  if (typeof canvasWidth === 'number') {
    width = canvasWidth
  }
  if (typeof canvasHeight === 'number') {
    height = canvasHeight
  }
  let _text = content
  if (_text && (canvasWidth === 'auto' || canvasHeight === 'auto')) {
    if (Array.isArray(_text)) {
      _text = _text.filter(Boolean)
    }

    if (canvasWidth === 'auto') {
      const _maxTextLength = Array.isArray(_text)
        ? get_string_width(deepCopy(_text).sort((a, b) => b.length - a.length)[0])
        : get_string_width(_text)
      width = _maxTextLength * fontSize + (_left + _right)
    }

    if (canvasHeight === 'auto') {
      let _rows = 1
      if (Array.isArray(_text)) {
        _rows = _text.length
      }
      height = _rows * fontSize + (_top + _bottom) + (_rows - 1) * rowGap
    }
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = height

  if (width && height) {
    drawCtx({ ctx, radius: borderRadius, width, height, backgroundColor })

    drawBorder({ ctx, width, height, borderStyle })

    if (_text) {
      drawText({ ctx, text: _text, fontStyle, top: _top, left: _left, rowGap })
    }
  }

  return canvas
}
