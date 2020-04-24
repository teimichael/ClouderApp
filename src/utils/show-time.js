
// 重新根据时间戳计算是否显示时间标记
export function reCaclTimestamp(originList) {
  const diffTime = 5 * 1000 // 两个对话之间相差的时间，大于此则显示
  const resultList = []
  var lastSentTime = 0
  // console.log('function, reCaclTimestamp, originlist = ', originList)
  originList.forEach(element => {
    element['isShowTime'] = isShowChatTime(element.updateDate, lastSentTime, diffTime)
    lastSentTime = element.updateDate
    resultList.push(element)
  })
  /* for (let i = 0; i < originList.length; i++) {
    const temp = originList[i].timestamp
    originList[i].isShowChatTime = isShowChatTime(temp, lastSentTime, diffTime)
    lastSentTime = originList[i].updateDate
    resultList.push(originList[i])
  }*/
  return resultList
}

// 是否显示时间
export function isShowChatTime(sentTime, lastSentTime, diffTime) {
  const show = sentTime - lastSentTime > diffTime
  return show
}
