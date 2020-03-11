import request from '@/utils/request'

export function getSelfInfo(token) {
  return request({
    url: '/user/get/info',
    method: 'get'
  })
}
