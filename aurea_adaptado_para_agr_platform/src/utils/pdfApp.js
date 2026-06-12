import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { FileViewer } from '@capacitor/file-viewer'

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      const result = String(reader.result || '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }

    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function descargarWeb(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function guardarYAbrirPdf(blob, nombreArchivo) {
  if (!blob) {
    throw new Error('No se recibió el archivo PDF.')
  }

  if (!Capacitor.isNativePlatform()) {
    descargarWeb(blob, nombreArchivo)
    return
  }

  const base64 = await blobToBase64(blob)

  const rutaArchivo = `aurea/pdf/${nombreArchivo}`

  const archivoGuardado = await Filesystem.writeFile({
    path: rutaArchivo,
    data: base64,
    directory: Directory.Documents,
    recursive: true
  })

  await FileViewer.openDocumentFromLocalPath({
    path: archivoGuardado.uri
  })
}