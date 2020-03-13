<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ user.name }}</div>
    <el-input v-model="uploadParam.path" placeholder="请输入路径" />
    <el-upload ref="file-upload" :headers="uploadHeader" :data="uploadParam" :multiple="true" :on-success="onSuccess" :on-error="onError" :action="uploadUrl" drag>
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + '/item/upload',
      uploadHeader: {
        Authorization: ''
      },
      uploadParam: {
        path: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'user'
    ])
  },
  mounted() {
    this.uploadHeader.Authorization = this.token
  },
  methods: {
    onSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success(response.message)
      } else {
        this.$refs['file-upload'].clearFiles()
        this.$message.error(response.message)
      }
    },
    onError(err, file, fileList) {
      this.$message.error(err)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
