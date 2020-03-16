import request from '@/utils/request'

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

export function getFolderList(parentFolderId) {
  return request({
    url: '/folder/list/' + parentFolderId,
    method: 'get',
    params: {
      parentFolderId: parentFolderId
    }
  })
}
