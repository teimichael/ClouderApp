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
    <br>
    <el-input v-model="downloadParam.itemId" placeholder="itemId" />
    <el-button type="primary" @click="downloadItem">下载</el-button>
    <br>
    <el-input v-model="previewParam.itemId" placeholder="itemId" />
    <el-button type="primary" @click="previewItem">预览</el-button>
    <div v-if="previewWindow.type===1">
      <el-image :src="previewWindow.obj">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline" />
        </div>
      </el-image>
    </div>
    <div v-else-if="previewWindow.type===2">
      <video-player
        ref="videoPlayer"
        class="video-player-box"
        :options="previewWindow.playerOptions"
        :playsinline="true"
      />
    </div>
    <div v-else-if="previewWindow.type===3">
      <canvas ref="myCanvas" class="pdf-container" />
    </div>
    <br>
    <ul>
      <li><span>文件夹</span> <i class="el-icon-folder" /></li>
      <li><span>图片</span> <i class="el-icon-picture-outline" /></li>
      <li><span>视频</span> <i class="el-icon-film" /></li>
      <li><span>音乐</span> <i class="el-icon-headset" /></li>
      <li><span>文档</span> <i class="el-icon-document" /></li>
      <li><span>压缩文件</span> <i class="el-icon-collection" /></li>
      <li><span>其他文件</span> <i class="el-icon-tickets" /></li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadCheck, uploadURL, downloadItem, previewItem } from '@/api/item'
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
import pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'

export default {
  name: 'Demo',
  components: {
    videoPlayer
  },
  data() {
    return {
      uploadHeader: {
        Authorization: ''
      },
      uploadParam: {
        name: '',
        folderId: 0,
        size: 0
      },
      downloadParam: {
        itemId: 0
      },
      previewParam: {
        itemId: 0
      },
      previewWindow: {
        type: 0,
        obj: '',
        playerOptions: {
          muted: true,
          language: 'en',
          preload: 'auto',
          fluid: true,
          playbackRates: [0.7, 1.0, 1.5, 2.0],
          sources: [{
            type: '',
            src: ''
          }],
          notSupportedMessage: '此视频暂无法播放，请稍后再试',
          controlBar: {
            timeDivider: true,
            durationDisplay: true,
            remainingTimeDisplay: true,
            fullscreenToggle: true
          }
        }
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
      downloadItem(this.downloadParam.itemId).then(response => {
        if (response.code === 200) {
          const link = document.createElement('a')
          link.setAttribute('href', response.data)
          link.click()
        } else {
          this.$message.error(response.message)
        }
      })
    },
    previewItem() {
      previewItem(this.previewParam.itemId).then(response => {
        if (response.code === 200) {
          const data = response.data
          this.previewWindow.type = data.type
          switch (this.previewWindow.type) {
            // Load image
            case 1:
              this.previewWindow.obj = 'data:image/png;base64,' + data.content
              break
            // Load video
            case 2:
              this.previewWindow.playerOptions.sources[0].type = data.contentType
              this.previewWindow.playerOptions.sources[0].src = data.content
              break
            // Load PDF
            case 3:
              this.previewWindow.obj = atob(data.content)
              this.previewPDF()
              break
          }
        } else {
          this.$message.error(response.message)
        }
      })
    },
    previewPDF() {
      const loadingTask = pdfjsLib.getDocument({
        data: this.previewWindow.obj
      })
      loadingTask.promise.then((pdf) => {
        const numPages = pdf.numPages
        const pageNumber = 1
        this.getPage(pdf, pageNumber, numPages)
      })
    },
    getPage(pdf, pageNumber, numPages) {
      pdf.getPage(pageNumber)
        .then((page) => {
          const scale = 1.5
          const viewport = page.getViewport({ scale: scale })
          const canvas = this.$refs.myCanvas

          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          const renderTask = page.render(renderContext)
          renderTask.promise.then(() => {
            // pageNumber += 1
            // if (pageNumber <= numPages) {
            //   _this.getPage(pdf, pageNumber, numPages)
            // }
          })
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
