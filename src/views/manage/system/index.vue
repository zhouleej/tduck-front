<template>
  <div class="app-container">
    <div class="config-card">
      <el-tabs v-model="activeName" @tab-click="handleTabClick" class="modern-tabs">
        <el-tab-pane label="系统配置" name="systemInfoConfig">
          <system-info-config v-if="activeName === 'systemInfoConfig'" />
        </el-tab-pane>
        <el-tab-pane label="文件存储" name="fileEnvConfig">
          <oss-config v-if="activeName === 'fileEnvConfig'" />
        </el-tab-pane>
        <el-tab-pane label="邮件配置" name="emailEnvConfig">
          <div class="config-form-wrapper">
            <el-form ref="emailEnvConfig" :model="form" label-position="top" class="modern-form">
              <el-form-item
                :rules="[{ required: true, message: '请输入邮件host', trigger: 'blur' }]"
                label="SMTP 服务器 (Host)"
                prop="host"
              >
                <el-input v-model="form.host" placeholder="例如：smtp.qq.com 或 smtp.163.com" class="modern-input" />
                <div class="form-hint">用于发送系统邮件的 SMTP 服务器地址</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入port', trigger: 'blur' }]"
                label="端口号 (Port)"
                prop="port"
              >
                <el-input v-model="form.port" placeholder="例如：465" class="modern-input" />
                <div class="form-hint">通常 SSL 加密端口为 465，非加密端口为 25</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入发件人用户名', trigger: 'blur' }]"
                label="发件人账号"
                prop="username"
              >
                <el-input v-model="form.username" placeholder="请输入完整的发件人邮箱账号" class="modern-input" />
                <div class="form-hint">用于发送邮件的邮箱完整账号，如 admin@example.com</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入授权码', trigger: 'blur' }]"
                label="邮箱授权码"
                prop="password"
              >
                <el-input v-model="form.password" placeholder="请输入 SMTP 授权码" show-password class="modern-input" />
                <div class="form-hint">
                  请填写邮箱的 SMTP 服务授权码（获取方式请查阅对应邮箱服务商文档），而非邮箱的登录密码
                </div>
              </el-form-item>
              <el-form-item class="form-action">
                <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="短信配置" name="smsEnvConfig">
          <div class="config-form-wrapper">
            <el-form ref="smsEnvConfig" :model="form" label-position="top" class="modern-form">
              <el-form-item
                :rules="[{ required: true, message: '请选择短信渠道', trigger: 'blur' }]"
                label="短信服务商渠道"
                prop="type"
              >
                <el-select v-model="form.type" placeholder="请选择短信渠道" class="modern-input" style="width: 100%">
                  <el-option label="阿里云" value="ALIYUN" />
                  <el-option label="腾讯云" value="TENCENT_CLOUD" />
                  <el-option label="中昱维信" value="VEESING" />
                  <el-option label="移动云云信" value="YUNXIN" />
                </el-select>
                <div class="form-hint">选择用于发送验证码或通知的服务商，移动云云信还支持问卷短信邀请</div>
              </el-form-item>
              <template v-if="form.type === 'YUNXIN'">
                <survey-sms-config :form="form" />
                <el-alert
                  title="请填写移动云信开户信息；问卷邀请模板与验证码模板分别配置，均须审核通过。"
                  type="info"
                  :closable="false"
                  show-icon
                  class="mb-20"
                />
                <el-form-item
                  v-for="field in yunxinFields"
                  :key="field.prop"
                  :label="field.label"
                  :prop="field.prop"
                  :rules="field.rules"
                >
                  <el-input
                    v-model="form[field.prop]"
                    :placeholder="field.placeholder"
                    :show-password="field.secret || false"
                    class="modern-input"
                  />
                  <div class="form-hint">{{ field.hint }}</div>
                </el-form-item>
                <el-form-item label="发送接口路径" prop="yunxinSendPath">
                  <el-select v-model="form.yunxinSendPath" placeholder="默认使用 V2 发送接口" style="width: 100%">
                    <el-option label="V2 接口（文档定义，默认）" value="/prod-api/tripartite/task/v2/send" />
                    <el-option label="原版接口（文档示例）" value="/prod-api/tripartite/task/send" />
                  </el-select>
                  <div class="form-hint">按实际网关选择，未选择时默认使用 V2 接口</div>
                </el-form-item>
                <el-form-item label="问卷邀请默认模板 ID" prop="yunxinInvitationTemplateId">
                  <el-input
                    v-model="form.yunxinInvitationTemplateId"
                    placeholder="请输入审核通过的问卷邀请模板 ID"
                    class="modern-input"
                  />
                  <div class="form-hint">
                    发布页可指定模板。推荐模板中固定问卷域名及 /s/，使用 #params_1# 接收问卷编号，避免完整链接超过变量
                    20 字符限制
                  </div>
                </el-form-item>
              </template>
              <el-form-item
                v-if="form.type == 'VEESING' || form.type == 'TENCENT_CLOUD'"
                :rules="[{ required: true, message: '请输入appId', trigger: 'blur' }]"
                label="应用 ID (AppId)"
                prop="appId"
              >
                <el-input v-model="form.appId" placeholder="请输入 AppId" class="modern-input" />
                <div class="form-hint">对应服务商控制台中的应用 ID (AppId)</div>
              </el-form-item>
              <el-form-item
                v-if="form.type == 'ALIYUN' || form.type == 'TENCENT_CLOUD'"
                :rules="[{ required: true, message: '请输入SecretId', trigger: 'blur' }]"
                :label="form.type == 'ALIYUN' ? 'AccessKeyID' : 'SecretId'"
                prop="secretId"
              >
                <el-input v-model="form.secretId" placeholder="请输入对应密钥 ID" class="modern-input" />
                <div class="form-hint">对应服务商控制台中的 API 密钥 ID</div>
              </el-form-item>
              <el-form-item
                v-if="form.type !== 'YUNXIN'"
                :rules="[{ required: true, message: '请输入密钥', trigger: 'blur' }]"
                :label="form.type == 'VEESING' ? 'AppKey' : form.type == 'ALIYUN' ? 'AccessKeySecret' : 'SecretKey'"
                prop="secretKey"
              >
                <el-input v-model="form.secretKey" placeholder="请输入对应密钥 Secret" class="modern-input" />
                <div class="form-hint">对应服务商控制台中的 API 密钥 Secret</div>
              </el-form-item>
              <el-form-item
                v-if="form.type == 'ALIYUN' || form.type == 'TENCENT_CLOUD'"
                :rules="[{ required: true, message: '请输入短信签名', trigger: 'blur' }]"
                label="短信签名"
                prop="sign"
              >
                <el-input v-model="form.sign" placeholder="请输入短信签名" class="modern-input" />
                <div class="form-hint">已在服务商处审核通过的短信签名，如：Tduck</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: form.type !== 'YUNXIN', message: '请输入模板id', trigger: 'blur' }]"
                label="短信验证码模板 ID"
                prop="templateId"
              >
                <el-input v-model="form.templateId" placeholder="请输入模板id" class="modern-input" />
                <div class="form-hint">
                  已在服务商处审核通过的短信验证码模板 ID。云信仅发送问卷邀请时可不填；验证码模板用 #params_1#
                  接收验证码
                </div>
              </el-form-item>
              <el-form-item class="form-action">
                <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="微信公众号" name="wxMpEnvConfig">
          <div class="config-form-wrapper">
            <el-form ref="wxMpEnvConfig" :model="form" label-position="top" class="modern-form">
              <el-form-item
                :rules="[{ required: true, message: '请输入appId', trigger: 'blur' }]"
                label="开发者 ID (AppID)"
                prop="appId"
              >
                <el-input v-model="form.appId" placeholder="请输入公众号 AppID" class="modern-input" />
                <div class="form-hint">微信公众平台 -> 开发 -> 基本配置中的 AppID</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入appSecret', trigger: 'blur' }]"
                label="开发者密码 (AppSecret)"
                prop="secret"
              >
                <el-input
                  v-model="form.secret"
                  placeholder="请输入公众号 AppSecret"
                  show-password
                  class="modern-input"
                />
                <div class="form-hint">微信公众平台 -> 开发 -> 基本配置中的 AppSecret</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入token', trigger: 'blur' }]"
                label="令牌 (Token)"
                prop="token"
              >
                <el-input v-model="form.token" placeholder="请输入 Token" class="modern-input" />
                <div class="form-hint">微信公众平台 -> 开发 -> 基本配置中的 Token，需与此处填写的保持一致</div>
              </el-form-item>
              <el-form-item
                :rules="[{ required: true, message: '请输入AESKey', trigger: 'blur' }]"
                label="消息加解密密钥 (EncodingAESKey)"
                prop="aesKey"
              >
                <el-input v-model="form.aesKey" placeholder="请输入 EncodingAESKey" class="modern-input" />
                <div class="form-hint">微信公众平台 -> 开发 -> 基本配置中的 EncodingAESKey，用于消息加解密</div>
              </el-form-item>
              <el-form-item class="form-action">
                <el-button type="primary" class="modern-btn" @click="handleSubmit"> 保 存 配 置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="AI 配置" name="deepSeekEnvConfig">
          <deep-seek-config v-if="activeName === 'deepSeekEnvConfig'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import ConfigMixin from './subconfig/ConfigMixin'
import SystemInfoConfig from './subconfig/SystemInfoConfig.vue'
import OssConfig from './subconfig/OssConfig.vue'
import DeepSeekConfig from './subconfig/DeepSeekConfig.vue'
import SurveySmsConfig from './subconfig/SurveySmsConfig.vue'

export default {
  name: 'ConfigForm',
  components: { SystemInfoConfig, OssConfig, DeepSeekConfig, SurveySmsConfig },
  mixins: [ConfigMixin],
  data() {
    const digitsRule = (length) => [
      { required: true, message: `请输入 ${length} 位数字`, trigger: 'blur' },
      { pattern: new RegExp(`^[0-9]{${length}}$`), message: `必须为 ${length} 位数字，请保留前导零`, trigger: 'blur' }
    ]
    return {
      yunxinFields: [
        {
          prop: 'yunxinBaseUrl',
          label: '云信网关地址',
          placeholder: '例如：https://gateway.example.com',
          hint: '开户方提供的网关根地址，仅含协议、主机和可选端口',
          rules: [
            { required: true, message: '请输入云信网关地址', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                try {
                  const url = new URL(value)
                  if (
                    !['http:', 'https:'].includes(url.protocol) ||
                    !url.hostname ||
                    url.username ||
                    url.password ||
                    url.search ||
                    url.hash ||
                    url.pathname !== '/'
                  )
                    throw new Error()
                  callback()
                } catch (e) {
                  callback(new Error('请填写仅包含 http(s) 协议、主机和端口的地址'))
                }
              },
              trigger: 'blur'
            }
          ]
        },
        {
          prop: 'yunxinUsername',
          label: '云信用户名',
          placeholder: '请输入云信平台用户名',
          hint: '云信平台账号，与 CRM 企业 ID 不同',
          rules: [{ required: true, whitespace: true, message: '请输入云信用户名', trigger: 'blur' }]
        },
        {
          prop: 'yunxinUserId',
          label: '企业 ID (userid)',
          placeholder: 'CRM 分配的 12 位企业 ID',
          hint: '参与请求鉴权，请按开户信息填写',
          secret: true,
          rules: digitsRule(12)
        },
        {
          prop: 'yunxinAccessNumber',
          label: '接入号',
          placeholder: 'CRM 分配的 8 位接入号',
          hint: '按字符串保存，保留前导零',
          rules: digitsRule(8)
        },
        {
          prop: 'yunxinExtendCode',
          label: '扩展码',
          placeholder: 'CRM 分配的 6 位扩展码',
          hint: '与接入号拼接为发送请求的 taskid',
          rules: digitsRule(6)
        }
      ]
    }
  },
  methods: {
    handleTabClick() {
      if (!['systemInfoConfig', 'fileEnvConfig', 'deepSeekEnvConfig'].includes(this.activeName)) {
        this.handleClick()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  min-height: calc(100vh - 84px);
  overflow-y: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  .config-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px 32px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
    min-height: 500px;
  }

  .modern-tabs {
    ::v-deep .el-tabs__item {
      font-size: 15px;
      font-weight: 500;
      color: #64748b;
      height: 48px;
      line-height: 48px;

      &.is-active {
        color: #3b82f6;
        font-weight: 600;
      }
    }

    ::v-deep .el-tabs__active-bar {
      background-color: #3b82f6;
      height: 3px;
      border-radius: 3px;
    }

    ::v-deep .el-tabs__nav-wrap::after {
      background-color: #e2e8f0;
      height: 1px;
    }
  }

  .config-form-wrapper {
    max-width: 600px;
    margin-top: 32px;
    margin-left: 16px;
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
}
</style>
