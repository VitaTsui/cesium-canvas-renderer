import loadImage from '../../_utils/loadImage'

type Padding = number | [number, number] | [number, number, number, number]

type Direction = 'vertical' | 'horizontal'

type ImgAlign = 'start' | 'center' | 'end'

interface ImageItem {
  url: string
  width?: number
  height?: number
}

interface ImageElement {
  image: HTMLImageElement
  width: number
  height: number
}

function get_img_maxWidth(images: ImageElement[], direction: Direction) {
  let width = 0

  if (direction === 'vertical') {
    width = images.reduce((prev, curr) => {
      return prev + curr.width
    }, 0)
  } else if (direction === 'horizontal') {
    width = images.reduce((prev, curr) => {
      return prev.height > curr.height ? prev : curr
    }).width
  }

  return width
}
function get_img_maxHeight(images: ImageElement[], direction: Direction) {
  let height = 0

  if (direction === 'vertical') {
    height = images.reduce((prev, curr) => {
      return prev.height > curr.height ? prev : curr
    }).height
  } else if (direction === 'horizontal') {
    height = images.reduce((prev, curr) => {
      return prev + curr.height
    }, 0)
  }

  return height
}

/**
 *
 */
interface DrawImgOptions {
  ctx: CanvasRenderingContext2D
  images: ImageElement[]
  top?: number
  left?: number
  gap?: number
  direction?: Direction
  imgAlign?: ImgAlign
}
function drawImg(options: DrawImgOptions) {
  const { ctx, images, top = 0, left = 0, gap = 0, direction = 'vertical', imgAlign = 'start' } = options

  const maxWidth = get_img_maxWidth(images, direction)
  const maxHeight = get_img_maxHeight(images, direction)

  if (direction === 'vertical') {
    let _left = left

    for (const image of images) {
      let _top = top
      if (imgAlign === 'center') {
        _top += (maxHeight - image.height) / 2
      } else if (imgAlign === 'end') {
        _top += maxHeight - image.height
      }

      ctx.drawImage(image.image, _left, _top, image.width, image.height)
      _left += image.width + gap
    }
  } else if (direction === 'horizontal') {
    let _top = top

    for (const image of images) {
      let _left = left
      if (imgAlign === 'center') {
        _left += (maxWidth - image.width) / 2
      } else if (imgAlign === 'end') {
        _left += maxWidth - image.width
      }

      ctx.drawImage(image.image, _left, _top, image.width, image.height)
      _top += image.height + gap
    }
  }
}

/**
 * 绘制 ImageGraphics
 */
export interface ImageGraphicsOptions {
  imgs: string | ImageItem | Array<string | ImageItem>
  padding?: Padding
  direction?: Direction
  gap?: number
  imgAlign?: ImgAlign
  width?: number | 'auto'
  height?: number | 'auto'
}
export default async function ImageGraphics(options: ImageGraphicsOptions) {
  const {
    imgs,
    direction = 'vertical',
    padding = 0,
    gap = 0,
    imgAlign = 'start',
    width: canvasWidth = 'auto',
    height: canvasHeight = 'auto'
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  let _imgs = Array.isArray(imgs) ? imgs : [imgs]
  _imgs = _imgs.filter(Boolean)

  if (!!_imgs.length) {
    const _images: ImageElement[] = []
    for (const img of _imgs) {
      let imgUrl = ''
      let [imgWidth, imgHeight] = [0, 0]
      if (typeof img === 'string') {
        imgUrl = img
      } else {
        imgUrl = img.url
        imgWidth = img.width || 0
        imgHeight = img.height || 0
      }
      const image = await loadImage(imgUrl)
      _images.push({
        image,
        width: imgWidth ?? image.width,
        height: imgHeight ?? image.height
      })
    }

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

    let [width, height] = [0, 0]
    if (typeof canvasWidth === 'number') {
      width = canvasWidth
    }
    if (typeof canvasHeight === 'number') {
      height = canvasHeight
    }
    if (!!_images.length && (canvasWidth === 'auto' || canvasHeight === 'auto')) {
      const _rows = _images.length

      if (canvasWidth === 'auto') {
        width =
          get_img_maxWidth(_images, direction) + (_left + _right) + (direction === 'vertical' ? (_rows - 1) * gap : 0)
      }

      if (canvasHeight === 'auto') {
        height =
          get_img_maxHeight(_images, direction) +
          (_top + _bottom) +
          (direction === 'horizontal' ? (_rows - 1) * gap : 0)
      }
    }

    canvas.width = width
    canvas.height = height

    if (width && height) {
      drawImg({
        ctx,
        images: _images,
        top: _top,
        left: _left,
        gap,
        direction,
        imgAlign
      })
    }
  }

  return canvas
}
