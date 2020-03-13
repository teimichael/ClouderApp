<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ user.name }}</div>
    <el-input v-model="uploadParam.path" placeholder="请输入路径，根目录为'/'" />
    <el-upload ref="file-upload" :headers="uploadHeader" :data="uploadParam" :multiple="true" :before-upload="beforeUpload" :on-success="onSuccess" :on-error="onError" :action="uploadUrl" drag>
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadCheck, upload } from '@/api/item'

export default {
  name: 'Dashboard',
  data() {
    return {
      uploadUrl: upload,
      uploadHeader: {
        Authorization: ''
      },
      uploadParam: {
        name: '',
        path: '',
        size: 0
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
    beforeUpload(file) {
      this.uploadParam.name = file.name
      this.uploadParam.size = file.size
      return uploadCheck(this.uploadParam)
    },
    onSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success(response.message)
      } else {
        this.$refs['file-upload'].clearFiles()
        this.$message.error(response.message)
      }
    },
    onError(err, file, fileList) {
      console.log(err)
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
