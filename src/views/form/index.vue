<template>
  <div class="form-index-container">
    <header class="form-editor-header">
      <div class="header-left">
        <div class="back-btn" @click="$router.back(-1)" title="返回">
          <i class="el-icon-back" />
        </div>
        <div class="logo-wrapper" @click="$router.push({ path: '/home' })">
          <img src="@/assets/images/logo-tduck-ce.svg" alt="TDUCK Logo" class="form-logo-img" />
        </div>
      </div>
      <div class="header-right">
        <el-button
          round
          class="action-btn"
          type="primary"
          plain
          icon="el-icon-view"
          @click="previewDialogVisible = true"
        >
          预览
        </el-button>
        <el-button
          round
          class="action-btn"
          type="primary"
          icon="el-icon-folder-add"
          @click="saveProjectAsTemplateHandle"
        >
          保存至模板中心
        </el-button>
      </div>
    </header>

    <div class="form-editor-body">
      <aside class="form-editor-sidebar">
        <div class="custom-el-menu">
          <div
            v-for="menuItem in menuItemList"
            :key="menuItem.route"
            class="el-menu-item"
            :class="{ 'is-active': defaultActiveMenu === menuItem.route }"
            @click="menuSelectHandle(menuItem.route)"
          >
            <i :class="menuItem.icon" />
            <span>{{ menuItem.title }}</span>
          </div>
        </div>
      </aside>

      <main class="form-editor-content">
        <router-view />
      </main>
    </div>

    <el-dialog
      :visible.sync="previewDialogVisible"
      append-to-body
      destroy-on-close
      fullscreen
      custom-class="preview-dialog"
    >
      <pre-view :key="previewKey" :preview-qrcode="true" @close="previewDialogVisible = false" />
    </el-dialog>
    <template-create ref="templateCreate" :form-key="projectKey" />
  </div>
</template>

<script>
import PreView from '@/views/form/preview'
import TemplateCreate from '@/views/project/template/create'

export default {
  name: 'NewIndex',
  components: { TemplateCreate, PreView },
  data() {
    return {
      previewKey: +new Date(),
      previewDialogVisible: false,
      defaultActiveMenu: 'editor',
      projectKey: null,
      menuItemList: [
        {
          title: '编辑',
          icon: 'el-icon-edit',
          route: '/project/form/editor'
        },
        {
          title: '逻辑',
          icon: 'el-icon-menu',
          route: '/project/form/logic'
        },
        {
          title: '外观',
          icon: 'el-icon-view',
          route: '/project/form/theme'
        },
        {
          title: '设置',
          icon: 'el-icon-setting',
          route: '/project/form/setting'
        },
        {
          title: '调研对象',
          icon: 'el-icon-user',
          route: '/project/form/survey'
        },
        {
          title: '短信模板',
          icon: 'el-icon-document',
          route: '/project/form/sms-templates'
        },
        {
          title: '短信邀请',
          icon: 'el-icon-message',
          route: '/project/form/sms-invitations'
        },
        {
          title: '发布',
          icon: 'el-icon-video-play',
          route: '/project/form/publish'
        },
        {
          title: '数据',
          icon: 'el-icon-s-data',
          route: '/project/form/data'
        },
        {
          title: '统计',
          icon: 'el-icon-data-line',
          route: '/project/form/statistics'
        }
      ]
    }
  },
  created() {
    this.projectKey = this.$route.query.key
    this.defaultActiveMenu = this.$route.path
  },
  methods: {
    menuSelectHandle(index) {
      this.defaultActiveMenu = index
      this.$router.replace({ path: index, query: { key: this.projectKey } })
    },
    openPreviewHandle() {
      this.previewKey = +new Date()
      this.previewDialogVisible = true
    },
    saveProjectAsTemplateHandle() {
      this.$refs['templateCreate'].handleOpen()
    }
  }
}
</script>

<style lang="scss" scoped>
.form-index-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  overflow: hidden;
  z-index: 1; /* 保证它位于正常的层级 */
}

.form-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  z-index: 10;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
  }

  .back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-right: 16px;
    cursor: pointer;
    transition: all 0.25s ease;
    color: #4b5563;
    background-color: transparent;

    i {
      font-size: 18px;
      font-weight: 600;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #3370ff;
    }
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: translateY(-1px);
      filter: drop-shadow(0 4px 12px rgba(51, 112, 255, 0.15));
    }

    .form-logo-img {
      height: 34px;
      width: auto;
      display: block;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .action-btn {
      border-radius: 8px;
      font-weight: 500;
      padding: 9px 16px;
      border: none;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      gap: 4px;

      &.el-button--primary.is-plain {
        background-color: #f0f4ff;
        color: #3370ff;
        &:hover {
          background-color: #e0eaff;
          transform: translateY(-1px);
        }
      }

      &.el-button--primary:not(.is-plain) {
        background: linear-gradient(135deg, #3370ff 0%, #1d4ed8 100%);
        box-shadow: 0 4px 12px rgba(51, 112, 255, 0.25);
        &:hover {
          box-shadow: 0 6px 16px rgba(51, 112, 255, 0.35);
          transform: translateY(-1px);
        }
      }
    }
  }
}

.form-editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.form-editor-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
  width: 90px !important;
  min-width: 90px !important;
  max-width: 90px !important;
  padding: 0 !important; /* 强制覆盖全局 aside 标签的默认 padding */
  margin: 0 !important;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
  box-sizing: border-box;

  .custom-el-menu {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    background-color: transparent;
    padding: 12px 8px;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 0px;
    }

    .el-menu-item {
      height: 64px;
      width: 74px; /* 90px (父宽度) - 16px (padding) = 74px */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border-radius: 12px;
      margin: 0 auto 8px auto;
      color: #4b5563;
      padding: 0;
      box-sizing: border-box;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;

      i {
        font-size: 20px;
        margin: 0;
        margin-bottom: 6px;
        color: inherit;
        transition: transform 0.25s ease;
      }

      span {
        font-size: 12px;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        display: block;
        text-align: center;
        width: 100%;
      }

      &:hover {
        background-color: #f7f8fa;
        color: #1f2937;
        i {
          transform: scale(1.1);
        }
      }

      &.is-active {
        background-color: #eff4ff;
        color: #3370ff;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background-color: #3370ff;
          border-radius: 4px;
        }
      }
    }
  }
}

.form-editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f7f8fa;
}

::v-deep .preview-dialog {
  background-color: #f3f4f6;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
    height: 100vh;
  }
}
</style>
