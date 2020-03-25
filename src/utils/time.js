export function getLocalTime(mS) {
  const date = new Date(mS)
  const Y = date.getFullYear()
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
  const D = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()

  /* const currentDate = new Date()
  const cY = currentDate.getFullYear()
  const cM = (currentDate.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
  const cD = currentDate.getDate()*/

  /* if (Y === cY && M === cM && D === cD) {
    const dH = h < 10 ? '0' + h : h
    const dM = m < 10 ? '0' + m : m
    return dH + ':' + dM
  } else {
    const dD = D < 10 ? '0' + D : D
    return Y + '/' + M + '/' + dD
  }*/
  const dD = D < 10 ? '0' + D : D
  const dH = h < 10 ? '0' + h : h
  const dM = m < 10 ? '0' + m : m
  return Y + '-' + M + '-' + dD + ' ' + dH + ':' + dM
}
