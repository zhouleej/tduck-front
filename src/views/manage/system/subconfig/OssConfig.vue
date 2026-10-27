<template>
  <div class="config-form-wrapper">
    <el-alert class="modern-alert" title="⚠️ 请注意，更改此配置后，需要重启后端项目才能生效" type="warning" show-icon>
      <a href="/help" target="_blank" class="alert-link">
        查看文件配置官方文档 <i class="el-icon-link"></i>
      </a>
    </el-alert>

    <el-form class="modern-form" ref="fileEnvConfig" :model="form" label-position="top">
      <el-form-item
        label="文件存储平台 (OSS Type)"
        prop="ossType"
        :rules="[{ required: true, message: '请选择存储平台', trigger: 'blur' }]"
      >
        <el-select v-model="form.ossType" placeholder="请选择存储平台" class="modern-input" style="width: 100%">
          <el-option label="阿里云 (Aliyun OSS)" value="ALIYUN" />
          <el-option label="七牛云 (Qiniu)" value="QINIU" />
          <el-option label="又拍云 (UpYun)" value="UPYUN" />
          <el-option label="本地存储 (Local)" value="LOCAL" />
          <el-option label="通用 S3 协议 (MinIO/AWS S3)" value="S3" />
        </el-select>
        <div class="form-hint">选择系统上传文件的存储服务提供商</div>
      </el-form-item>

      <el-form-item
        v-if="form.ossType !== 'LOCAL'"
        label="访问密钥 ID (AccessKeyID)"
        prop="accessKeyId"
        :rules="[{ required: true, message: '请输入AccessKeyID', trigger: 'blur' }]"
      >
        <el-input class="modern-input" v-model="form.accessKeyId" placeholder="请输入 AccessKeyID" />
        <div class="form-hint">对应云存储服务商提供的 API 访问密钥 ID</div>
      </el-form-item>

      <el-form-item
        v-if="form.ossType !== 'LOCAL'"
        label="访问密钥 Secret (AccessKeySecret)"
        prop="accessKeySecret"
        :rules="[{ required: true, message: '请输入AccessKeySecret', trigger: 'blur' }]"
      >
        <el-input v-model="form.accessKeySecret" placeholder="请输入 AccessKeySecret" class="modern-input" />
        <div class="form-hint">对应云存储服务商提供的 API 访问密钥 Secret</div>
      </el-form-item>

      <el-form-item
        v-if="form.ossType === 'ALIYUN' || form.ossType === 'S3'"
        label="区域节点 (Endpoint)"
        prop="endpoint"
        :rules="[{ required: true, message: '请输入Endpoint', trigger: 'blur' }]"
      >
        <el-input v-model="form.endpoint" placeholder="例如：oss-cn-hangzhou.aliyuncs.com" class="modern-input" />
        <div class="form-hint">云存储的区域节点地址 (Endpoint) 或 S3 服务的连接地址</div>
      </el-form-item>

      <el-form-item
        v-if="form.ossType !== 'LOCAL'"
        label="存储桶名称 (BucketName)"
        prop="bucketName"
        :rules="[{ required: true, message: '请输入bucketName', trigger: 'blur' }]"
      >
        <el-input v-model="form.bucketName" placeholder="请输入 bucketName" class="modern-input" />
        <div class="form-hint">在云存储服务商控制台创建的存储空间 / 存储桶 (Bucket) 名称</div>
      </el-form-item>

      <el-form-item
        v-if="form.ossType === 'LOCAL'"
        label="本地存储绝对路径 (Upload Folder)"
        prop="uploadFolder"
        :rules="[{ required: true, message: '请输入存储路径', trigger: 'blur' }]"
      >
        <el-input v-model="form.uploadFolder" placeholder="例如：/www/mobile-survey/upload/" class="modern-input" />
        <div class="form-hint">部署后端的服务器上的绝对路径，需确保应用有读写权限</div>
      </el-form-item>

      <el-form-item
        label="外网访问域名 (Domain)"
        prop="domain"
        :rules="[{ required: true, message: '请输入能访问文件的域名', trigger: 'blur' }]"
      >
        <el-input v-model="form.domain" placeholder="例如：https://survey.example.com/oss/" class="modern-input" />
        <div class="form-hint">
          用于前端访问上传文件的公网 URL 访问域名，以 http:// 或 https:// 开头并以斜杠 (/) 结尾
        </div>
      </el-form-item>

      <el-form-item class="form-action">
        <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ConfigMixin from './ConfigMixin'

export default {
  name: 'OssConfig',
  mixins: [ConfigMixin],
  data() {
    return {}
  },
  async created() {
    this.activeName = 'fileEnvConfig'
    await this.handleClick()
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
.config-form-wrapper {
  max-width: 800px;
  margin-top: 16px;
  margin-left: 16px;
}

.modern-alert {
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid #fbd38d;
  background-color: #fffaf0;

  ::v-deep .el-alert__title {
    font-size: 14px;
    font-weight: 500;
    color: #c05621;
  }

  .alert-link {
    display: inline-block;
    margin-top: 8px;
    color: #dd6b20;
    font-weight: 500;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.modern-form {
  ::v-deep .el-form-item {
    margin-bottom: 28px;

    .el-form-item__label {
      font-weight: 600;
      color: #1e293b;
      padding-bottom: 8px;
      line-height: 1.4;
    }
  }

  .form-hint {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 6px;
    line-height: 1.5;
  }

  .form-action {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;
  }
}

.modern-input {
  ::v-deep .el-input__inner {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 0 16px;
    height: 42px;
    line-height: 42px;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #334155;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
}

.modern-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 32px;
  font-size: 14px;
  transition: all 0.2s;
  border: none;

  &.el-button--primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    &:hover {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    &:active {
      transform: translateY(1px);
    }
  }
}
</style>



