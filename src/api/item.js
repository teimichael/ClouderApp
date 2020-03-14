import request from '@/utils/request'

export function deleteItem(data) {
  return request({
    url: '/item/delete',
    method: 'post',
    params: {
      itemName: data.itemName,
      itemPath: data.itemPath
    }
  })
}

export function downloadItem(data) {
  return request({
    url: '/item/download',
    method: 'get',
    params: {
      itemName: data.itemName,
      itemPath: data.itemPath
    }
  })
}

export function getItemListByFolder(data) {
  return request({
    url: '/item/list',
    method: 'get',
    params: {
      folderPath: data.folderPath,
      page: data.page,
      size: data.size
    }
  })
}

export function getItemPreview(data) {
  return request({
    url: '/item/preview',
    method: 'get',
    params: {
      itemName: data.itemName,
      itemPath: data.itemPath,
      token: data.token
    }
  })
}

export function uploadItem(data) {
  return request({
    url: '/item/upload',
    method: 'post',
    params: {
      name: data.name,
      path: data.path
    }
  })
}

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
