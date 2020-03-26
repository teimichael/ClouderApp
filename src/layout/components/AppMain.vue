<template>
  <section class="app-main">
    <!--top function button-->
    <el-row style="margin: 1rem; padding-top: 20px">
      <el-col :span="12">
        <el-dropdown>
          <el-upload
            ref="file-upload"
            :headers="uploadHeader"
            :data="uploadParam"
            :multiple="true"
            :before-upload="beforeUpload"
            :on-progress="uploadProgress"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :action="uploadUrl"
            :show-file-list="false"
            style="display:inline"
          >
            <el-button type="primary" icon="el-icon-upload">上传</el-button>
          </el-upload>
          <el-dropdown-menu slot="dropdown" style="margin-top: .5rem">
            <el-dropdown-item @click.native="uploadDialogVisible = true">查看上传状态</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button icon="el-icon-folder-add" plain @click="createFolderDialogVisible = true">新建文件夹</el-button>
      </el-col>
      <el-col :span="12">
        <div>
          <el-input v-model="searchContent" placeholder="place input..." class="input-with-select">
            <el-button slot="append" icon="el-icon-search" />
          </el-input>
        </div>
      </el-col>
      <!--<el-col :span="2">
        <el-dropdown>
          <el-button icon="el-icon-sort" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="sortByName()">名称</el-dropdown-item>
            <el-dropdown-item @click.native="sortBySize()">大小</el-dropdown-item>
            <el-dropdown-item @click.native="sortByDate()">更新日期</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>-->
    </el-row>
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
    <!--upload dialog-->
    <el-dialog
      title="上传列表"
      :visible.sync="uploadDialogVisible"
      :modal="false"
      top="50vh"
    >
      <el-table
        :data="uploadList"
        size="small"
        height="30vh"
        fit
        highlight-current-row
      >
        <el-table-column property="name" label="文件名">
          <template slot-scope="scope">
            {{ scope.row.name }}
            <span v-if="scope.row.isabort" style="color: #909399">&nbsp;&nbsp;上传已取消</span>
          </template>
        </el-table-column>
        <el-table-column property="size" label="文件大小" width="100">
          <template slot-scope="scope">
            {{ getSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column property="progress" label="上传进度" width="150">
          <template slot-scope="scope">
            {{ scope.row.percentage | uploadProgressEllipsis }}%
            <el-container style="float: right">
              <!--<el-tooltip content="暂停" placement="bottom" effect="light">
                <el-button type="text" icon="el-icon-more" style="padding: 0" />
              </el-tooltip>-->
              <el-tooltip content="取消上传" placement="bottom" effect="light">
                <el-button type="text" icon="el-icon-delete" style="padding: 0" @click="abortUpload(scope.row)" />
              </el-tooltip>
            </el-container>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--new folder dialog-->
    <el-dialog title="新建文件夹" :visible.sync="createFolderDialogVisible">
      <el-form :model="createFolderForm">
        <el-form-item label="名称" :label-width="formLabelWidth">
          <el-input v-model="createFolderForm.folderName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createFolderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createFolder()">确 定</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadCheck, uploadURL } from '@/api/item'
import { getSize } from '@/utils/size'
import { Message } from 'element-ui'
import { createFolder } from '@/api/folder'

export default {
  name: 'AppMain',
  filters: {
    uploadProgressEllipsis(value) {
      if (!value) return 0
      if (String(value).length > 5) {
        return String(value).slice(0, 5)
      }
      return value
    }
  },
  data() {
    return {
      formLabelWidth: '120px',
      searchContent: '',
      uploadHeader: {
        Authorization: ''
      },
      uploadParam: {
        name: '',
        folderId: 0,
        size: 0
      },
      uploadList: [],
      uploadDialogVisible: false,
      createFolderDialogVisible: false,
      createFolderForm: {
        folderName: '',
        path: ''
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
    },
    key() {
      return this.$route.path
    }
  },
  mounted() {
    this.uploadHeader.Authorization = this.token
  },
  methods: {
    beforeUpload(file) {
      this.uploadParam.name = file.name
      this.uploadParam.size = file.size
      this.uploadParam.folderId = this.getFolderId()
      this.uploadDialogVisible = true
      return uploadCheck(this.uploadParam)
    },
    uploadProgress(event, file, fileList) {
      this.uploadList = fileList
    },
    uploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success(response.message)
        /* this.fetchData()*/
        this.$store.dispatch('file/setRefreshList', true)
      } else {
        this.$refs['file-upload'].clearFiles()
        this.$message.error(response.message)
      }
    },
    uploadError(err, file, fileList) {
      console.log(err)
      this.$message.error(err)
    },
    abortUpload(file) {
      console.log(file)
      this.$refs['file-upload'].abort(file)
      file.isabort = true
    },
    getSize(data) {
      return getSize(data)
    },
    createFolder() {
      this.createFolderDialogVisible = false
      this.createFolderForm.parentFolderId = this.getFolderId()
      createFolder(this.createFolderForm).then(() => {
        Message({
          message: '创建成功',
          type: 'success',
          duration: 5 * 1000
        })
        /* this.fetchData()*/
        this.$store.dispatch('file/setRefreshList', true)
      }).catch(() => {
        Message({
          message: '创建失败',
          type: 'error',
          duration: 5 * 1000
        })
      })
    },
    getFolderId() {
      if (this.$router.currentRoute.params.id) {
        return this.$router.currentRoute.params.id
      } else {
        return this.user.depository.rootFolder.id
      }
    }
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
