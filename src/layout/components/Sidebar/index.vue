<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
    <el-progress class="store-capacity" :text-inside="true" :stroke-width="26" :percentage="currentPercentage" :format="format" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { getSize } from '@/utils/size'

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      currentPercentage: 0,
      userInfo: {
        depository: {
          usedSpace: 0,
          capacity: 0
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  mounted() {
    this.userInfo = this.$store.state.user.user
    this.currentPercentage = (this.userInfo.depository.usedSpace * 100) / this.userInfo.depository.capacity
  },
  methods: {
    format(percentage) {
      return `${getSize(this.userInfo.depository.usedSpace)} / ${getSize(this.userInfo.depository.capacity)}`
    }
  }
}
</script>

<style scoped>
  .store-capacity {
    margin: .7rem;
  }
  .store-capacity >>> .el-progress-bar__innerText {
    color: black;
  }
</style>
