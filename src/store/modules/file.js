
const state = {
  filePathInfo: [],
  refreshList: false
}

const mutations = {
  PUSH_FILE_INFO: (state, fileInfo) => {
    state.filePathInfo.push(fileInfo)
  },
  SET_FILE_PATH_INFO: (state, length) => {
    state.filePathInfo.length = length
  },
  SET_REFRESH_LIST: (state, data) => {
    state.refreshList = data
  }
}

const actions = {
  pushFileInfo({ commit }, fileInfo) {
    commit('PUSH_FILE_INFO', fileInfo)
  },
  setFilePathLength({ commit }, length) {
    commit('SET_FILE_PATH_INFO', length)
  },
  setRefreshList({ commit }, data) {
    commit('SET_REFRESH_LIST', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
