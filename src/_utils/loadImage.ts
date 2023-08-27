// 图片阻塞请求缓存
const imagePromiseCache: { [key: string]: Promise<HTMLImageElement> | undefined } = {}

// 图片缓存
const imageCache: { [key: string]: HTMLImageElement } = {}

export default async function loadImage(url: string) {
  // 如果图片已经请求过了，则直接返回缓存
  if (imageCache[url]) return imageCache[url]
  // 如果图片正在请求中，则返回请求中的图片
  if (imagePromiseCache[url]) return imagePromiseCache[url] as Promise<HTMLImageElement>

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.src = url

    image.onload = () => {
      resolve(image)
      imageCache[url] = image
    }
    image.onerror = () => {
      reject()
    }
  })
  imagePromiseCache[url] = imagePromise

  return imagePromise
}
