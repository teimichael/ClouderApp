
const state = {
  filePathInfo: []
}

const mutations = {
  PUSH_FILE_INFO: (state, fileInfo) => {
    state.filePathInfo.push(fileInfo)
  },
  SET_FILE_PATH_INFO: (state, length) => {
    state.filePathInfo.length = length
  }
}

const actions = {
  pushFileInfo({ commit }, fileInfo) {
    commit('PUSH_FILE_INFO', fileInfo)
  },
  setFilePathLength({ commit }, length) {
    commit('SET_FILE_PATH_INFO', length)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
