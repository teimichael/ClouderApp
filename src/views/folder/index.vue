<template>
  <!--folder list-->
  <div class="app-container">
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
        <template><!--slot-scope="scope"-->
          <el-button-group>
            <el-button type="info" icon="el-icon-message" />
            <el-button type="success" icon="el-icon-check" />
            <el-button type="danger" icon="el-icon-delete" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="text" @click="createFolderDialogVisible = true">创建文件夹</el-button>
    <el-button type="text" @click="goParentDirectory()">返回上级目录</el-button>
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
import { getItemListByFolder } from '@/api/item'
import { Message } from 'element-ui'

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
      formLabelWidth: '120px'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
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
    }
  }
}
</script>

<style scoped>

</style>
