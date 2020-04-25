export function getSize(data) {
  if (data !== undefined) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let i = 0
    while (Math.floor(data / 1024) !== 0) {
      i += 1
      data /= 1024
    }
    return data.toFixed(2) + units[i]
  }
}
