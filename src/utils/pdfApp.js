function descargarWeb(blob, nombreArchivo = 'documento.pdf') {
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function guardarYAbrirPdf(blob, nombreArchivo = 'documento.pdf') {
  if (!blob) {
    throw new Error('No se recibió el archivo PDF.')
  }

  descargarWeb(blob, nombreArchivo)
}