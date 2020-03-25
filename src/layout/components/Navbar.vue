<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <el-button style="padding: 1rem" type="text" @click="goFileIndex()">网盘</el-button>
    <el-button style="padding: 1rem" type="text">动态</el-button>
    <el-button style="padding: 1rem" type="text">分享</el-button>
    <el-button style="padding: 1rem" type="text">找资源</el-button>
    <el-button style="padding: 1rem" type="text">更多</el-button>

    <!--<breadcrumb class="breadcrumb-container" />-->

    <div class="right-menu">
      <el-dropdown class="avatar-container" style="margin-top: 5px">
        <span class="el-dropdown-link">
          <img :src="user.avatar" width="40px" height="40px" style="vertical-align:middle">
          {{ user.name }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <!--<div class="avatar-wrapper">
          <img :src="user.avatar" class="user-avatar">
          <span>用户名</span>
          <i class="el-icon-caret-bottom" />
        </div>-->
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              Home
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="">
            <el-dropdown-item>个人资料</el-dropdown-item>
          </a>
          <a target="_blank" href="">
            <el-dropdown-item>帮助</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
/* import Breadcrumb from '@/components/Breadcrumb'*/
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    /* Breadcrumb,*/
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'user'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    goFileIndex() {
      this.$store.dispatch('file/setFilePathLength', 0)
      this.$router.push('/file/index')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
