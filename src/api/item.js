import request from '@/utils/request'

export function getItemListByItemType(data) {
  return request({
    url: '/item/' + data.itemType + '/list',
    method: 'get',
    params: {
      page: data.page,
      size: data.size
    }
  })
}

export function copyItem(data) {
  return request({
    url: '/item/copy/' + data.itemId + '/to/' + data.destFolderId,
    method: 'post',
    params: {
      destFolderId: data.destFolderId,
      itemId: data.itemId
    }
  })
}

export function deleteItem(itemId) {
  return request({
    url: '/item/delete/' + itemId,
    method: 'post',
    params: {
      itemId: itemId
    }
  })
}

export function downloadItem(itemId) {
  return request({
    url: '/item/download/' + itemId,
    method: 'get',
    params: {
      itemId: itemId
    }
  })
}

export function previewItem(itemId) {
  return request({
    url: '/item/preview/' + itemId,
    method: 'get'
  })
}

export function getItemListByFolderId(data) {
  return request({
    url: '/item/in/' + data.folderId + '/list/',
    method: 'get',
    params: {
      folderId: data.folderId,
      page: data.page,
      size: data.size
    }
  })
}

export function moveItem(data) {
  return request({
    url: '/item/move/' + data.itemId + '/to/' + data.destFolderId,
    method: 'post',
    params: {
      destFolderId: data.destFolderId,
      itemId: data.itemId
    }
  })
}

export function renameItem(data) {
  return request({
    url: '/item/rename/' + data.itemId,
    method: 'post',
    params: {
      itemId: data.itemId,
      name: data.name
    }
  })
}

export function shareItem(itemId) {
  return request({
    url: '/item/share/' + itemId,
    method: 'get'
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
