<template>
  <div class="app-container">
    <!--top function button-->
    <el-row style="margin: 1rem">
      <el-col :span="12">
        <el-upload
          ref="file-upload"
          :headers="uploadHeader"
          :data="uploadParam"
          :multiple="true"
          :before-upload="beforeUpload"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :action="uploadUrl"
          :show-file-list="false"
          style="display:inline"
        >
          <!--<i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>-->
          <el-button type="primary" icon="el-icon-upload">上传</el-button>
        </el-upload>
        <el-button icon="el-icon-folder-add" plain @click="createFolderDialogVisible = true">新建文件夹</el-button>
        <el-button type="text" @click="goParentDirectory()">返回上级目录</el-button>
      </el-col>
      <el-col :span="10">
        <div>
          <el-input v-model="searchContent" placeholder="place input..." class="input-with-select">
            <el-button slot="append" icon="el-icon-search" />
          </el-input>
        </div>
      </el-col>
      <el-col :span="2">
        <el-dropdown>
          <el-button icon="el-icon-sort" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>名称</el-dropdown-item>
            <el-dropdown-item>大小</el-dropdown-item>
            <el-dropdown-item>更新日期</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <!--path-->
    <el-row style="margin: 1rem">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in filePath" :key="item.id">
          <a @click.prevent="goPathPage(item.id, index)">{{ item.name }}</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </el-row>
    <!--item list-->
    <el-table
      v-loading="listLoading"
      :data="list.data"
      element-loading-text="Loading"
      size="small"
      fit
      highlight-current-row
      @row-dblclick="dblClickFolder"
      @row-click="singleClickFolder"
      @cell-mouse-enter="enterFile"
      @cell-mouse-leave="leaveFile"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="文件名">
        <template slot-scope="scope">
          {{ scope.row.name }}
          <el-container v-if="scope.row.showFunctionBtn" style="float: right">
            <el-button type="text" icon="el-icon-edit" style="padding: 0" />
            <el-button type="text" icon="el-icon-share" style="padding: 0" />
            <el-button type="text" icon="el-icon-delete" style="padding: 0" />
          </el-container>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="160">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="修改日期" width="220">
        <template slot-scope="scope">
          {{ scope.row.updateDate }}
        </template>
      </el-table-column>
      <!--<el-table-column label="操作" align="center">
        <template>&lt;!&ndash;slot-scope="scope"&ndash;&gt;
          <el-button-group>
            <el-button type="info" icon="el-icon-message" />
            <el-button type="success" icon="el-icon-check" />
            <el-button type="danger" icon="el-icon-delete" />
          </el-button-group>
        </template>
      </el-table-column>-->
    </el-table>

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
  </div>
</template>

<script>
import { createFolder, getFolderList } from '@/api/folder'
import { uploadCheck, uploadURL, getItemListByFolderId, deleteItem } from '@/api/item'
import { Message } from 'element-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'Folder',
  data() {
    return {
      searchContent: '',
      filePath: [],
      list: {
        id: 0,
        data: []
      },
      showFunctionBtn: false,
      listLoading: true,
      createFolderDialogVisible: false,
      createFolderForm: {
        folderName: '',
        path: ''
      },
      formLabelWidth: '120px',
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
      'user',
      'filePathInfo'
    ]),
    device() {
      return this.$store.state.app.device
    },
    uploadUrl: function() {
      return uploadURL(this.uploadParam.folderId)
    }
  },
  mounted() {
    this.uploadHeader.Authorization = this.token
    console.log('filePathInfo')
    console.log(this.filePathInfo)
    /* 判断是否为文件首页*/
    if (!this.$router.currentRoute.params.id) {
      this.$store.dispatch('file/setFilePathLength', 0)// 目录初始化
      /* 首页写入目录*/
      const fileInfoInit = {
        name: '全部文件',
        id: this.user.depository.rootFolder.id
      }
      this.$store.dispatch('file/pushFileInfo', fileInfoInit)
    } else { //  非首页
      if (this.filePathInfo.length === 0) {
        const fileInfoInit = {
          name: '全部文件',
          id: this.user.depository.rootFolder.id
        }
        this.$store.dispatch('file/pushFileInfo', fileInfoInit)
      }
      /* 判断目录是否和路径同步*/
      if (this.filePathInfo[this.filePathInfo.length - 1].id !== Number(this.$router.currentRoute.params.id)) {
        this.$router.push('/file/index')
      }
    }

    this.filePath = this.filePathInfo

    /* if (this.filePathInfo.length === 0) {
      const fileInfoInit = {
        name: '全部文件',
        id: this.user.depository.rootFolder.id
      }
      console.log('fileInfoInit')
      console.log(fileInfoInit)
      this.$store.dispatch('file/pushFileInfo', fileInfoInit)
      if (this.$router.currentRoute.params.id) {
        this.$router.push('/file/index')
      }
      console.log(this.filePathInfo)
      this.filePath = this.filePathInfo
    } else {
      if (this.filePathInfo[this.filePathInfo.length - 1].id !== Number(this.$router.currentRoute.params.id)) {
        this.$store.dispatch('file/setFilePathLength', 0)
        this.$router.push('/file/index')
      }
      this.filePath = this.filePathInfo
    }*/

    if (this.$router.currentRoute.params.id) {
      this.list.id = this.$router.currentRoute.params.id
    } else {
      this.list.id = this.user.depository.rootFolder.id
    }
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      this.list.data = []
      getFolderList(this.list.id).then(response => {
        console.log('Folder list')
        console.log(response)
        this.list.data = response.data
      }).then(() => {
        const folderInfo = {
          folderId: this.list.id,
          page: 0,
          size: 20
        }
        getItemListByFolderId(folderInfo).then(response => {
          console.log('Item list')
          console.log(response)
          /* this.itemList = response.data.content*/
          this.list.data.push(...response.data.content)
          this.listLoading = false
        }).catch(error => {
          console.log(error)
          this.listLoading = false
        })
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    },
    createFolder() {
      this.createFolderDialogVisible = false
      this.createFolderForm.parentFolderId = this.list.id
      createFolder(this.createFolderForm).then(() => {
        Message({
          message: '创建成功',
          type: 'success',
          duration: 5 * 1000
        })
        this.fetchData()
      }).catch(() => {
        Message({
          message: '创建失败',
          type: 'error',
          duration: 5 * 1000
        })
      })
    },
    clickFolder(row, event, column) {
      if (!row.size) {
        const fileInfo = {
          name: row.name,
          id: row.id
        }
        this.$store.dispatch('file/pushFileInfo', fileInfo)
        this.$router.push('/file/list/' + row.id)
      }
      this.listLoading = false
    },
    singleClickFolder(row) {
      if (this.device === 'mobile') {
        this.listLoading = true
        this.clickFolder(row)
      }
    },
    dblClickFolder(row) {
      if (this.device !== 'mobile') {
        this.listLoading = true
        this.clickFolder(row)
      }
    },
    enterFile(row) {
      this.$set(row, 'showFunctionBtn', true)
    },
    leaveFile(row) {
      this.$set(row, 'showFunctionBtn', false)
    },
    goPathPage(foldId, length) {
      this.$store.dispatch('file/setFilePathLength', length + 1)
      this.$router.push('/file/list/' + foldId)
    },
    goParentDirectory() {
      if (this.list.id !== this.user.depository.rootFolder.id) {
        this.$store.dispatch('file/setFilePathLength', this.filePath.length - 1)
        this.$router.go(-1)
      }
    },
    beforeUpload(file) {
      this.uploadParam.name = file.name
      this.uploadParam.size = file.size
      this.uploadParam.folderId = this.list.id
      return uploadCheck(this.uploadParam)
    },
    uploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message.success(response.message)
        this.fetchData()
      } else {
        this.$refs['file-upload'].clearFiles()
        this.$message.error(response.message)
      }
    },
    uploadError(err, file, fileList) {
      console.log(err)
      this.$message.error(err)
    },
    deleteItem(row) {
      /* const deleteItemInfo = {
        itemName: row.name,
        itemPath: row.path
      }*/
      deleteItem(row.id).then(() => {
        Message({
          message: '删除成功',
          type: 'success',
          duration: 5 * 1000
        })
        this.fetchData()
      }).catch(() => {
        Message({
          message: '删除失败',
          type: 'error',
          duration: 5 * 1000
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
