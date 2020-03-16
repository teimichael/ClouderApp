import request from '@/utils/request'

export function deleteItem(itemId) {
  return request({
    url: '/item/delete/' + itemId,
    method: 'post'/* ,
    params: {
      itemName: data.itemName,
      itemPath: data.itemPath
    }*/
  })
}

export function downloadItem(itemId) {
  return request({
    url: '/item/download/' + itemId,
    method: 'get'
  })
}

export function getItemListByFolderId(data) {
  return request({
    url: '/item/list/' + data.folderId,
    method: 'get',
    params: {
      folderId: data.folderId,
      page: data.page,
      size: data.size
    }
  })
}

export function getItemPreview(itemId) {
  return request({
    url: '/item/preview/' + itemId,
    method: 'get'/* ,
    params: {
      itemName: data.itemName,
      itemPath: data.itemPath,
      token: data.token
    }*/
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
      folderId: data.folderId,
      name: data.name,
      size: data.size
    }
  })
}

export function uploadURL(folderId) {
  return process.env.VUE_APP_BASE_API + '/item/upload/to/' + folderId
}
