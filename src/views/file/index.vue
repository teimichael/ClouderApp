<template>
  <div class="app-container" style="height: 100vh" @click="closeContextmenuFolder">
    <!--top function button-->
    <el-row style="margin: 1rem">
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
            <el-dropdown-item @click.native="sortByName()">名称</el-dropdown-item>
            <el-dropdown-item @click.native="sortBySize()">大小</el-dropdown-item>
            <el-dropdown-item @click.native="sortByDate()">更新日期</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <!--path-->
    <el-row style="margin: 1rem">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-if="filePath.length>1">
          <a @click.prevent="goParentDirectory()">返回上级目录</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(item, index) in filePath" :key="item.id">
          <a @click.prevent="goPathPage(item.id, index)">{{ item.name }}</a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </el-row>
    <!--item list-->
    <el-table
      ref="fileList"
      v-loading="listLoading"
      :data="list.data"
      :default-sort="ListSort"
      element-loading-text="Loading"
      size="small"
      fit
      highlight-current-row
      @row-dblclick="dblClickFolder"
      @row-click="singleClickFolder"
      @row-contextmenu="contextmenuFolder"
      @cell-mouse-enter="enterFile"
      @cell-mouse-leave="leaveFile"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column prop="name" label="文件名" sortable>
        <template slot-scope="scope">
          <el-button type="text" :icon="fileIcon(scope.row)" size="mini" @click="clickFolder(scope.row)">{{ scope.row.name }}</el-button>
          <el-container v-if="scope.row.showFunctionBtn" style="float: right">
            <el-tooltip content="分享" placement="bottom" effect="light">
              <el-button type="text" icon="el-icon-share" style="padding: 0" />
            </el-tooltip>
            <el-tooltip content="下载" placement="bottom" effect="light">
              <el-button type="text" icon="el-icon-download" style="padding: 0" @click.prevent="downloadItem(scope.row)" />
            </el-tooltip>
            <el-dropdown trigger="click" @visible-change="moreBtnVisible">
              <span class="el-dropdown-link">
                <el-tooltip content="更多" placement="bottom" effect="light">
                  <el-button type="text" icon="el-icon-more" style="padding: 0; margin-left: 10px" />
                </el-tooltip>
              </span>
              <el-dropdown-menu slot="dropdown" style="margin-top: 0">
                <el-dropdown-item @click.native="moveItemTo(scope.row)">移动到</el-dropdown-item>
                <el-dropdown-item @click.native="copyItemTo(scope.row)">复制到</el-dropdown-item>
                <el-dropdown-item @click.native="openRenameForm(scope.row)">重命名</el-dropdown-item>
                <el-dropdown-item @click.native="deleteItem(scope.row)">删除</el-dropdown-item>
                <el-dropdown-item>设置共享</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-container>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="160" sortable>
        <template slot-scope="scope">
          {{ getSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="date" label="修改日期" width="220" sortable>
        <template slot-scope="scope">
          {{ getUpdateTime(scope.row.updateDate) }}
        </template>
      </el-table-column>
    </el-table>
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
    <!--rename dialog-->
    <el-dialog title="重命名" :visible.sync="renameDialogVisible">
      <el-form :model="renameForm">
        <el-form-item label="原名称" :label-width="formLabelWidth">
          <el-input v-model="renameForm.oldName" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="新名称" :label-width="formLabelWidth">
          <el-input v-model="renameForm.newName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="renameDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="renameItem()">确 定</el-button>
      </div>
    </el-dialog>
    <!--folder tree-->
    <el-dialog :title="tree.title" :visible.sync="folderTreeDialogVisible">
      <div style="height: 200px; overflow: auto; border-style:solid; border-width: 1px; border-color: #EBEEF5">
        <el-tree
          ref="folderTree"
          :props="treeProps"
          :load="treeLoadNode"
          :check-strictly="true"
          node-key="id"
          lazy
          show-checkbox
          @check-change="orgCheckChange"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="folderTreeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDestFolderId">确 定</el-button>
      </div>
    </el-dialog>
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
        <el-table-column property="progress" label="下载进度" width="150">
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
    <!--oncontextmenu-->
    <div ref="oncontextmenuInFileList" style="display: none; width:120px; background:#ffffff; position:fixed; left: 500px; top: 500px; box-shadow:1px 1px 1px 1px #807878; z-index: 900">
      <ul style="list-style: none; margin: 0; padding: 0; text-align: center">
        <li @click="clickFolder(currentRow)"><el-button type="text" size="medium">打开</el-button></li>
        <li style="border-bottom: solid 1px darkgrey" @click="downloadItem(currentRow)"><el-button type="text" size="medium">下载</el-button></li>
        <li style="border-bottom: solid 1px darkgrey"><el-button type="text" size="medium">分享</el-button></li>
        <li @click="copyItemTo(currentRow)"><el-button type="text" size="medium">复制到</el-button></li>
        <li style="border-bottom: solid 1px darkgrey" @click="moveItemTo(currentRow)"><el-button type="text" size="medium">移动到</el-button></li>
        <li @click="openRenameForm(currentRow)"><el-button type="text" size="medium">重命名</el-button></li>
        <li style="border-bottom: solid 1px darkgrey" @click="deleteItem(currentRow)"><el-button type="text" size="medium">删除</el-button></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getFolderContent, createFolder, deleteFolder, renameFolder, getFolderList, moveFolder, copyFolder } from '@/api/folder'
import { uploadCheck, uploadURL, getItemListByFolderId, deleteItem, downloadItem, renameItem, moveItem, copyItem, previewItem } from '@/api/item'
import { Message } from 'element-ui'
import { mapGetters } from 'vuex'
import { getLocalTime } from '@/utils/time'

export default {
  name: 'Folder',
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
      searchContent: '',
      filePath: [],
      list: {
        id: 0,
        data: []
      },
      ListSort: { prop: 'date', order: 'ascending' },
      showFunctionBtn: false,
      listLoading: true,
      createFolderDialogVisible: false,
      createFolderForm: {
        folderName: '',
        path: ''
      },
      renameDialogVisible: false,
      renameForm: {
        oldName: '',
        newName: ''
      },
      formLabelWidth: '120px',
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
      moreBtnDropActive: false,
      tree: {
        title: ''
      },
      folderTreeDialogVisible: false,
      treeProps: {
        label: 'name',
        children: 'zone'
      },
      selectOrg: {
        orgId: []
      },
      currentRow: {}
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
      const currentFolderInfo = {
        folderId: this.list.id,
        page: 0,
        size: 20
      }
      getFolderContent(currentFolderInfo).then(response => {
        console.log('Folder content')
        console.log(response)
        this.list.data = response.data.folders
        this.list.data.push(...response.data.items.content)
        if (response.data.items.totalPages !== 1) {
          for (let i = 1; i < response.data.items.totalPages; i++) {
            const folderInfo = {
              folderId: this.list.id,
              page: i,
              size: 20
            }
            getItemListByFolderId(folderInfo).then(response => {
              console.log('Item list')
              console.log(response)
              this.list.data.push(...response.data.content)
            }).catch(error => {
              console.log(error)
            })
          }
        }
        this.listLoading = false
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
      /* getFolderList(this.list.id).then(response => {
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
          /!* this.itemList = response.data.content*!/
          this.list.data.push(...response.data.content)
          this.listLoading = false
        }).catch(error => {
          console.log(error)
          this.listLoading = false
        })
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })*/
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
    openRenameForm(row) {
      if (row.suffix) {
        this.renameForm.type = 'd'
        this.renameForm.itemId = row.id
      } else {
        this.renameForm.type = 'f'
        this.renameForm.folderId = row.id
      }
      this.renameForm.oldName = row.name
      this.renameDialogVisible = true
    },
    clickFolder(row, event, column) {
      if (!row.suffix) {
        const fileInfo = {
          name: row.name,
          id: row.id
        }
        this.$store.dispatch('file/pushFileInfo', fileInfo)
        this.$router.push('/file/list/' + row.id)
      } else {
        previewItem(row.id).then(response => {
          if (response.code === 200) {
            console.log(response)
            const data = response.data
            window.open(data.content, '_blank')
          } else {
            this.$message.error(response.message)
          }
        })
      }
      this.listLoading = false
    },
    singleClickFolder(row) {
      this.closeContextmenuFolder()
      if (this.device === 'mobile') {
        this.listLoading = true
        this.clickFolder(row)
      }
    },
    contextmenuFolder(row, column, event) {
      console.log(row)
      if (event.button === 2) {
        /* 屏蔽鼠标右键*/
        document.oncontextmenu = () => { return false }
        this.currentRow = row
        this.$refs.oncontextmenuInFileList.style.left = event.clientX + 'px'
        this.$refs.oncontextmenuInFileList.style.top = event.clientY + 'px'
        this.$refs.oncontextmenuInFileList.style.display = 'block'
      }
    },
    closeContextmenuFolder() {
      this.$refs.oncontextmenuInFileList.style.display = 'none'
      document.oncontextmenu = () => { return true }
    },
    dblClickFolder(row) {
      if (this.device !== 'mobile') {
        this.listLoading = true
        this.clickFolder(row)
      }
    },
    enterFile(row) {
      if (this.moreBtnDropActive === false) {
        this.$set(row, 'showFunctionBtn', true)
      }
    },
    leaveFile(row) {
      if (this.moreBtnDropActive === false) {
        this.$set(row, 'showFunctionBtn', false)
      }
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
      this.uploadDialogVisible = true
      return uploadCheck(this.uploadParam)
    },
    uploadProgress(event, file, fileList) {
      console.log('event')
      console.log(event)
      console.log('file')
      console.log(file)
      console.log('fileList')
      console.log(fileList)
      this.uploadList = fileList
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
    abortUpload(file) {
      console.log(file)
      this.$refs['file-upload'].abort(file)
      file.isabort = true
    },
    deleteItem(row) {
      console.log('delete')
      if (row.suffix) {
        console.log('delete1')
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
      } else {
        console.log('delete2')
        deleteFolder(row.id).then(() => {
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
      console.log('delete3')
    },
    renameItem() {
      const itemInfo = {
        name: this.renameForm.newName
      }
      if (this.renameForm.type === 'd') {
        itemInfo.itemId = this.renameForm.itemId
        renameItem(itemInfo).then(() => {
          Message({
            message: '重命名成功',
            type: 'success',
            duration: 5 * 1000
          })
          this.fetchData()
          this.renameDialogVisible = false
        }).catch(() => {
          Message({
            message: '重命名失败',
            type: 'error',
            duration: 5 * 1000
          })
        })
      } else {
        itemInfo.folderId = this.renameForm.folderId
        renameFolder(itemInfo).then(() => {
          Message({
            message: '重命名成功',
            type: 'success',
            duration: 5 * 1000
          })
          this.fetchData()
          this.renameDialogVisible = false
        }).catch(() => {
          Message({
            message: '重命名失败',
            type: 'error',
            duration: 5 * 1000
          })
        })
      }
    },
    downloadItem(row) {
      if (row.suffix) { //  判断是否为文件
        console.log('download')
        const itemId = row.id
        downloadItem(itemId).then(response => {
          const link = document.createElement('a')
          link.setAttribute('href', response.data)
          link.click()
          this.$message({
            showClose: true,
            message: '开始下载',
            type: 'info',
            duration: 3 * 1000
          })
        })
      } else {
        this.$message({
          showClose: true,
          message: '文件夹暂不支持下载',
          type: 'error',
          duration: 3 * 1000
        })
      }
    },
    moreBtnVisible(v) {
      this.moreBtnDropActive = v
    },
    sortByName() {
      this.$refs.fileList.sort('name')
    },
    sortBySize() {
      this.$refs.fileList.sort('size')
    },
    sortByDate() {
      this.$refs.fileList.sort('date')
    },
    copyItemTo(row) {
      this.tree.title = '复制到'
      this.tree.handle = 'copy'
      if (row.suffix) {
        this.tree.itemType = 'd'
        this.tree.itemId = row.id
        this.tree.folderId = row.folderId
      } else {
        this.tree.itemType = 'f'
        this.tree.folderId = row.id
      }
      this.folderTreeDialogVisible = true
    },
    moveItemTo(row) {
      this.tree.title = '移动到'
      this.tree.handle = 'move'
      if (row.suffix) {
        this.tree.typeType = 'd'
        this.tree.itemId = row.id
        this.tree.folderId = row.folderId
      } else {
        this.tree.typeType = 'f'
        this.tree.folderId = row.id
      }
      this.folderTreeDialogVisible = true
    },
    treeLoadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: '全部文件', id: this.user.depository.rootFolder.id }])
      }
      if (node.level > 5) {
        return resolve([])
      }
      console.log(node)
      getFolderList(node.data.id).then(response => {
        console.log(response.data)
        const res = []
        for (const value of response.data) {
          res.push({
            name: value.name,
            id: value.id
          })
        }
        return resolve(res)
      })
      return resolve([])
    },
    orgCheckChange(data, checked, indeterminate) {
      /* console.log(data, '数据')
      console.log(checked, '选中状态')
      console.log(indeterminate, '子树中选中状态')*/
      // 获取当前选择的id在数组中的索引
      const index = this.selectOrg.orgId.indexOf(data.id)
      // 如果不存在数组中，并且数组中已经有一个id并且checked为true的时候，代表不能再次选择。
      if (index < 0 && this.selectOrg.orgId.length === 1 && checked) {
        console.log('only one')
        this.$message({
          message: '只能选择一个区域！',
          type: 'error',
          showClose: true
        })
        // 设置已选择的节点为false 很重要
        this.$refs.folderTree.setChecked(data, false)
      } else if (this.selectOrg.orgId.length === 0 && checked) {
        // 发现数组为空 并且是已选择
        // 防止数组有值，首先清空，再push
        this.selectOrg.orgId = []
        this.selectOrg.orgId.push(data.id)
      } else if (
        index >= 0 &&
        this.selectOrg.orgId.length === 1 &&
        !checked
      ) {
        // 再次直接进行赋值为空操作
        this.selectOrg.orgId = []
      }
    },
    submitDestFolderId() {
      this.tree.destFolderId = this.$refs.folderTree.getCheckedNodes()[0].id
      console.log(this.tree)
      if (this.tree.destFolderId === this.tree.folderId) {
        Message({
          message: '目标文件夹为当前文件夹',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        if (this.tree.itemType === 'd') {
          const handledData = {
            destFolderId: this.tree.destFolderId,
            itemId: this.tree.itemId
          }
          if (this.tree.handle === 'move') {
            moveItem(handledData).then(() => {
              Message({
                message: '移动成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              Message({
                message: '移动失败',
                type: 'error',
                duration: 5 * 1000
              })
            })
          } else {
            copyItem(handledData).then(() => {
              Message({
                message: '复制成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              Message({
                message: '复制失败',
                type: 'error',
                duration: 5 * 1000
              })
            })
          }
        } else {
          const handledData = {
            destFolderId: this.tree.destFolderId,
            folderId: this.tree.folderId
          }
          if (this.tree.handle === 'move') {
            moveFolder(handledData).then(() => {
              Message({
                message: '移动成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              Message({
                message: '移动失败',
                type: 'error',
                duration: 5 * 1000
              })
            })
          } else {
            copyFolder(handledData).then(() => {
              Message({
                message: '复制成功',
                type: 'success',
                duration: 5 * 1000
              })
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              Message({
                message: '复制失败',
                type: 'error',
                duration: 5 * 1000
              })
            })
          }
        }
      }
    },
    fileIcon(row) {
      if (row.type) {
        switch (row.type) {
          case 1:
            return 'el-icon-picture-outline'
          case 2:
            return 'el-icon-film'
          case 3:
            return 'el-icon-document'
          default:
            return 'el-icon-tickets'
        }
      } else {
        return 'el-icon-folder'
      }
    },
    getUpdateTime(data) {
      return getLocalTime(data)
    },
    getSize(data) {
      if (data) {
        if (data > (1024 * 1024 * 1024)) {
          const sizeInG = data / (1024 * 1024 * 1024)
          return String(sizeInG).slice(0, 5) + 'G'
        }
        if (data > (1024 * 1024)) {
          const sizeInM = data / (1024 * 1024)
          return String(sizeInM).slice(0, 5) + 'M'
        }
        const sizeInKB = data / 1024
        return String(sizeInKB).slice(0, 5) + 'KB'
      }
    }
  }
}
</script>

<style scoped>

</style>
