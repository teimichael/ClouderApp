import request from '@/utils/request'

export function getFolderContent(data) {
  return request({
    url: '/folder/' + data.folderId + '/content',
    method: 'get',
    params: {
      folderId: data.folderId,
      page: data.page,
      size: data.size
    }
  })
}

export function copyFolder(data) {
  return request({
    url: '/folder/copy/' + data.folderId + '/to/' + data.destFolderId,
    method: 'post',
    params: {
      destFolderId: data.destFolderId,
      folderId: data.folderId
    }
  })
}

export function createFolder(data) {
  return request({
    url: '/folder/create/in/' + data.parentFolderId,
    method: 'post',
    params: {
      folderName: data.folderName,
      parentFolderId: data.parentFolderId
    }
  })
}

export function deleteFolder(folderId) {
  return request({
    url: '/folder/delete/' + folderId,
    method: 'post',
    params: {
      folderId: folderId
    }
  })
}

export function moveFolder(data) {
  return request({
    url: '/folder/move/' + data.folderId + '/to/' + data.destFolderId,
    method: 'post',
    params: {
      destFolderId: data.destFolderId,
      folderId: data.folderId
    }
  })
}

export function renameFolder(data) {
  return request({
    url: '/folder/rename/' + data.folderId,
    method: 'post',
    params: {
      folderId: data.folderId,
      name: data.name
    }
  })
}

export function getFolderList(parentFolderId) {
  return request({
    url: '/folder/list/' + parentFolderId,
    method: 'get',
    params: {
      parentFolderId: parentFolderId
    }
  })
}
