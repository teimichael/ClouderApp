<template>
  <!--folder list-->
  <div class="app-container">
    <h3>文件夹列表</h3>
    <el-table
      v-loading="listLoading"
      :data="list.data"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @row-click="clickFolder"
    >
      <el-table-column align="center" label="Index" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="ID" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="parentFolderId" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.parentFolderId }}
        </template>
      </el-table-column>
      <el-table-column label="path" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>
      <el-table-column label="depositoryId" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.depositoryId }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template><!--slot-scope="scope"-->
          <el-button-group>
            <el-button type="info" icon="el-icon-message" />
            <el-button type="success" icon="el-icon-check" />
            <el-button type="danger" icon="el-icon-delete" />
          </el-button-group>
        </template>
      </el-table-column>
      <!--<el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>-->
    </el-table>
    <!--item list-->
    <h3>文件列表</h3>
    <el-table
      v-loading="listLoading"
      :data="itemList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="Index" width="95">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column label="name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="ID" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="size" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="path" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.path }}
        </template>
      </el-table-column>
      <el-table-column label="updateDate" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateDate }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="info" icon="el-icon-message" />
            <el-button type="success" icon="el-icon-check" />
            <el-button type="danger" icon="el-icon-delete" @click="deleteItem(scope.row)" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="text" @click="createFolderDialogVisible = true">创建文件夹</el-button>
    <el-button type="text" @click="goParentDirectory()">返回上级目录</el-button>
    <el-upload ref="file-upload" :headers="uploadHeader" :data="uploadParam" :multiple="true" :before-upload="beforeUpload" :on-success="uploadSuccess" :on-error="uploadError" :action="uploadUrl" drag>
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>
    <el-dialog title="创建文件夹" :visible.sync="createFolderDialogVisible">
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
import { uploadCheck, upload, getItemListByFolder, deleteItem } from '@/api/item'
import { Message } from 'element-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'Folder',
  data() {
    return {
      list: {
        oldPath: '/',
        path: '/',
        data: null
      },
      itemList: null,
      listLoading: true,
      createFolderDialogVisible: false,
      createFolderForm: {
        folderName: '',
        path: ''
      },
      formLabelWidth: '120px',
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
      'token'
    ])
  },
  created() {
    this.fetchData()
  },
  mounted() {
    this.uploadHeader.Authorization = this.token
  },
  methods: {
    fetchData() {
      this.listLoading = true
      this.itemList = null
      getFolderList(this.list.path).then(response => {
        console.log('Folder list')
        console.log(response)
        this.list.data = response.data
      }).then(() => {
        const folderInfo = {
          folderPath: this.list.path,
          page: 0,
          size: 20
        }
        getItemListByFolder(folderInfo).then(response => {
          console.log('Item list')
          console.log(response)
          this.itemList = response.data.content
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
      this.createFolderForm.path = this.list.path
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
      this.list.oldPath = this.list.path
      this.list.path = row.path
      this.fetchData()
    },
    goParentDirectory() {
      if (this.list.oldPath !== this.list.path) {
        this.list.path = this.list.oldPath
        this.fetchData()
      }
    },
    beforeUpload(file) {
      this.uploadParam.name = file.name
      this.uploadParam.size = file.size
      this.uploadParam.path = this.list.path
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
