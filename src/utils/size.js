export function getSize(data) {
  if (data) {
    if (data > (1024 * 1024 * 1024)) {
      const sizeInG = data / (1024 * 1024 * 1024)
      return sizeInG.toFixed(2) + 'G'
    }
    if (data > (1024 * 1024)) {
      const sizeInM = data / (1024 * 1024)
      return sizeInM.toFixed(2) + 'M'
    }
    const sizeInKB = data / 1024
    return sizeInKB.toFixed(2) + 'KB'
  }
}
