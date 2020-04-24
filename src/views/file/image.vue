<template>
  <div>
    <div>image</div>
    <!--<div v-for="image in reCaclTimestamp(imageList)" :key="image.id">
      <el-row v-if="image.isShowTime">
        <el-col :span="24">{{ getUpdateTime(image.updateDate) }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="18">
          <el-button type="text" icon="el-icon-picture-outline" size="mini" @click="clickImage(image)">{{ image.name }}</el-button>
          &lt;!&ndash;<el-container v-if="image.showFunctionBtn" style="float: right">
            <el-tooltip content="分享" placement="bottom" effect="light">
              <el-button type="text" icon="el-icon-share" style="padding: 0" />
            </el-tooltip>
            <el-tooltip content="下载" placement="bottom" effect="light">
              <el-button type="text" icon="el-icon-download" style="padding: 0" @click.prevent="downloadItem(scope.row)" />
            </el-tooltip>
          </el-container>&ndash;&gt;
        </el-col>
        <el-col :span="6">{{ getSize(image.size) }}</el-col>
      </el-row>
    </div>-->
  </div>
</template>

<script>
import { getItemListByItemType } from '@/api/item'
import { previewItem } from '@/api/item'
import { getSize } from '@/utils/size'
import { getLocalTime } from '@/utils/time'
import { reCaclTimestamp } from '@/utils/show-time'

export default {
  name: 'ImageList',
  data() {
    return {
      listInfo: {
        itemType: 1,
        page: 0,
        size: 20
      },
      imageList: []
    }
  },
  mounted() {
    console.log('hello')
    this.getImageList(this.listInfo)
  },
  methods: {
    getImageList(listInfo) {
      getItemListByItemType(listInfo).then(res => {
        console.log('Image List')
        console.log(res)
        this.imageList = res.data.content
      })
    },
    clickImage(image) {
      previewItem(image.id).then(response => {
        if (response.code === 200) {
          console.log(response)
          const data = response.data
          window.open(data.content, '_blank')
        } else {
          this.$message.error(response.message)
        }
      })
    },
    getSize(data) {
      return getSize(data)
    },
    getUpdateTime(data) {
      return getLocalTime(data)
    },
    reCaclTimestamp(list) {
      return reCaclTimestamp(list)
    }
  }
}
</script>

<style scoped>

</style>
