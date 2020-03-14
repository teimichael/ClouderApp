<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ user.name }}</div>
    <el-input v-model="uploadParam.folderId" placeholder="folderId" />
    <el-upload ref="file-upload" :headers="uploadHeader" :data="uploadParam" :multiple="true" :before-upload="beforeUpload" :on-success="onSuccess" :on-error="onError" :action="uploadUrl" drag>
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>

    <el-button type="primary" @click="downloadItem">下载</el-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadCheck, uploadURL, downloadItem } from '@/api/item'

export default {
  name: 'Demo',
  data() {
    return {
      uploadHeader: {
        Authorization: ''
      },
      uploadParam: {
        name: '',
        folderId: 0,
        size: 0
      }
    }
  },
  computed: {
    ...mapGetters([
      'token',
      'user'
    ]),
    uploadUrl: function() {
      return uploadURL(this.uploadParam.folderId)
    }
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
    },
    downloadItem() {
      const itemId = 1
      downloadItem(itemId).then(response => {
        const link = document.createElement('a')
        link.setAttribute('href', response.data)
        link.click()
      })
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
