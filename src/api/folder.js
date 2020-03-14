import request from '@/utils/request'

export function createFolder(data) {
  return request({
    url: '/folder/create',
    method: 'post',
    params: {
      folderName: data.folderName,
      path: data.path
    }
  })
}

export function getFolderList(folderPath) {
  return request({
    url: '/folder/list',
    method: 'get',
    params: {
      folderPath: folderPath
    }
  })
}
