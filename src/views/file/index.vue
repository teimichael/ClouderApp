<template>
  <div class="app-container" @click="closeContextmenuFolder">
    <!--path-->
    <el-row v-if="$router.currentRoute.meta.fileType === undefined" style="margin: 1rem">
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
              <el-button type="text" icon="el-icon-share" style="padding: 0" @click.prevent="shareItem(scope.row)" />
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
    <!--share dialog-->
    <el-dialog title="分享" :visible.sync="shareDialogVisible">
      <el-form :model="shareForm">
        <el-form-item label="data" :label-width="formLabelWidth">
          <el-input v-model="shareForm.data" autocomplete="off" />
        </el-form-item>
        <el-form-item label="message" :label-width="formLabelWidth">
          <el-input v-model="shareForm.message" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shareDialogVisible = false">取 消</el-button>
        <el-button v-clipboard:copy="shareForm.data" v-clipboard:success="clipboardSuccess" type="primary">复制到剪切板</el-button>
      </div>
      <!--<div slot="footer" class="dialog-footer">
        <el-button @click="shareDialogVisible = false">取 消</el-button>
        <el-button type="primary">复制到剪切板</el-button>
      </div>-->
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

    <pagination v-if="totalFiles>0" :total="totalFiles" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="fetchData" />
  </div>
</template>

<script>
import { getFolderContent, deleteFolder, renameFolder, getFolderList, moveFolder, copyFolder } from '@/api/folder'
import { deleteItem, downloadItem, renameItem, moveItem, copyItem, previewItem, getItemListByItemType, shareItem } from '@/api/item'
import { mapGetters } from 'vuex'
import { getLocalTime } from '@/utils/time'
import { getSize } from '@/utils/size'
import Pagination from '@/components/Pagination'
import clipboard from '@/directive/clipboard/index.js' // use clipboard by v-directive

export default {
  name: 'Folder',
  directives: {
    clipboard
  },
  components: { Pagination },
  data() {
    return {
      totalFiles: 0,
      listQuery: {
        page: 0,
        size: 20
      },
      filePath: [],
      list: {
        id: 0,
        data: []
      },
      ListSort: { prop: 'date', order: 'ascending' },
      showFunctionBtn: false,
      listLoading: true,
      renameDialogVisible: false,
      shareDialogVisible: false,
      renameForm: {
        oldName: '',
        newName: ''
      },
      shareForm: {
        data: '',
        message: ''
      },
      formLabelWidth: '120px',
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
      currentRow: {},
      listInfo: {
        itemType: -1,
        page: 0,
        size: 20
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
    refreshList: function() {
      return this.$store.state.file.refreshList
    }
  },
  watch: {
    refreshList: function(val) {
      if (val === true) {
        this.fetchData()
        this.$store.dispatch('file/setRefreshList', false)
      }
    }
  },
  mounted() {
    console.log('filePathInfo')
    console.log(this.$router.currentRoute.meta.fileType)
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
      if (this.$router.currentRoute.meta.fileType === undefined) {
        this.list.data = []
        const currentFolderInfo = {
          folderId: this.list.id,
          page: this.listQuery.page,
          size: this.listQuery.size
        }
        if (currentFolderInfo.page !== 0) {
          currentFolderInfo.page--
        }
        console.log(currentFolderInfo)
        getFolderContent(currentFolderInfo).then(response => {
          console.log('Folder content')
          console.log(response)
          if (currentFolderInfo.page === 0) {
            this.list.data = response.data.folders
            this.list.data.push(...response.data.items.content)
            this.totalFiles = response.data.items.totalElements
          } else {
            this.list.data = response.data.items.content
          }
          this.listLoading = false
        }).catch(error => {
          console.log(error)
          this.listLoading = false
        })
      } else {
        this.listInfo.itemType = this.$router.currentRoute.meta.fileType
        this.listInfo.page = this.listQuery.page
        this.listInfo.size = this.listQuery.size
        if (this.listInfo.page !== 0) {
          this.listInfo.page--
        }
        getItemListByItemType(this.listInfo).then(res => {
          console.log('Image List')
          console.log(res)
          this.list.data = res.data.content
          this.totalFiles = res.data.totalElements
          this.listLoading = false
        })
      }
    },
    openRenameForm(row) {
      if (row.type !== undefined) {
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
      if (row.type === undefined) {
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
    deleteItem(row) {
      console.log('delete')
      if (row.type !== undefined) {
        console.log('delete1')
        deleteItem(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      } else {
        console.log('delete2')
        deleteFolder(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(() => {
          this.$message.error('删除失败')
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
          this.$message.success('重命名成功')
          this.fetchData()
          this.renameDialogVisible = false
        }).catch(() => {
          this.$message.error('重命名失败')
        })
      } else {
        itemInfo.folderId = this.renameForm.folderId
        renameFolder(itemInfo).then(() => {
          this.$message.success('重命名成功')
          this.fetchData()
          this.renameDialogVisible = false
        }).catch(() => {
          this.$message.error('重命名失败')
        })
      }
    },
    shareItem(row) {
      console.log('share')
      if (row.type !== undefined) {
        shareItem(row.id).then(res => {
          console.log(res)
          this.shareForm.data = res.data
          this.shareForm.message = res.message
          this.shareDialogVisible = true
        }).catch(error => {
          console.log(error)
        })
      } else {
        console.log('无法分享文件夹')
      }
    },
    downloadItem(row) {
      if (row.type !== undefined) { //  判断是否为文件
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
    copyItemTo(row) {
      this.tree.title = '复制到'
      this.tree.handle = 'copy'
      if (row.type !== undefined) {
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
      if (row.type !== undefined) {
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
        this.$message.error('目标文件夹为当前文件夹')
      } else {
        if (this.tree.itemType === 'd') {
          const handledData = {
            destFolderId: this.tree.destFolderId,
            itemId: this.tree.itemId
          }
          if (this.tree.handle === 'move') {
            moveItem(handledData).then(() => {
              this.$message.success('移动成功')
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              this.$message.error('移动失败')
            })
          } else {
            copyItem(handledData).then(() => {
              this.$message.success('复制成功')
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              this.$message.error('复制失败')
            })
          }
        } else {
          const handledData = {
            destFolderId: this.tree.destFolderId,
            folderId: this.tree.folderId
          }
          if (this.tree.handle === 'move') {
            moveFolder(handledData).then(() => {
              this.$message.success('移动成功')
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              this.$message.error('移动失败')
            })
          } else {
            copyFolder(handledData).then(() => {
              this.$message.success('复制成功')
              this.fetchData()
              this.folderTreeDialogVisible = false
            }).catch(() => {
              this.$message.error('复制失败')
            })
          }
        }
      }
    },
    fileIcon(row) {
      if (row.type !== undefined) {
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
      return getSize(data)
    },
    clipboardSuccess() {
      this.$message({
        message: 'Copy successfully',
        type: 'success',
        duration: 1500
      })
    }
  }
}
</script>

<style scoped>

</style>
