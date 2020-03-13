import request from '@/utils/request'

export function uploadCheck(data) {
  return request({
    url: '/item/upload/check',
    method: 'post',
    params: {
      path: data.path,
      name: data.name,
      size: data.size
    }
  })
}

export const upload = process.env.VUE_APP_BASE_API + '/item/upload'
