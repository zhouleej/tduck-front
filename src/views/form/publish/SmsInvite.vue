<template>
  <div class="sms-invite-card" v-loading="loading">
    <div class="card-header">
      <i class="el-icon-message"></i>
      <h3>短信邀请</h3>
    </div>
    <p class="card-desc">通过移动云云信，将已审核的问卷邀请短信发送给受访者</p>
    <el-alert
      v-if="!loading && !enabled"
      :title="configError || '请联系管理员在系统配置 → 短信配置中启用移动云云信'"
      type="info"
      :closable="false"
      show-icon
    />
    <el-button v-if="configError" class="retry-button" @click="loadConfig">重新加载</el-button>
    <el-form v-if="enabled" ref="inviteForm" :model="form" label-position="top">
      <el-form-item
        label="邀请短信模板 ID"
        prop="templateId"
        :rules="[{ required: true, whitespace: true, message: '请输入已审核通过的邀请模板 ID', trigger: 'blur' }]"
      >
        <el-input
          v-model="form.templateId"
          placeholder="默认使用管理员配置的邀请模板，可按本问卷修改"
          :disabled="sending"
        />
      </el-form-item>
      <el-form-item label="收件人手机号" prop="phones" :rules="[{ validator: validatePhones, trigger: 'blur' }]">
        <el-input
          v-model="form.phones"
          type="textarea"
          :rows="4"
          placeholder="每行一个 11 位手机号，也可使用逗号、分号或空格分隔，每次最多 100 个号码"
          :disabled="sending"
        />
        <div class="form-hint">已识别 {{ phoneNumbers.length }} 个不同号码，相同号码自动去重</div>
      </el-form-item>
      <el-form-item label="模板类型">
        <el-radio-group v-model="variableTemplate" :disabled="sending">
          <el-radio :label="true">变量文本模板</el-radio>
          <el-radio :label="false">普通文本模板</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="variableTemplate">
        <el-alert
          title="请在已审核模板中固定问卷域名及 /s/，使用 #params_1# 接收问卷编号。每个变量最多 20 字符。"
          type="info"
          :closable="false"
          show-icon
        />
        <el-form-item
          v-for="(value, index) in form.variables"
          :key="index"
          :label="`变量 p${index + 1}（#params_${index + 1}#）`"
          :prop="`variables.${index}`"
          :rules="[{ validator: validateVariable, trigger: 'blur' }]"
        >
          <el-input
            v-model="form.variables[index]"
            :placeholder="index === 0 ? '默认填写本问卷编号' : '按审核模板填写变量内容'"
            :disabled="sending"
          />
        </el-form-item>
        <div class="variable-actions">
          <el-button size="small" :disabled="sending || form.variables.length >= 30" @click="form.variables.push('')"
            >添加变量</el-button
          >
          <el-button size="small" :disabled="sending || form.variables.length <= 1" @click="form.variables.pop()"
            >移除最后一个变量</el-button
          >
        </div>
      </template>
      <el-alert
        v-else
        title="普通模板须已包含本问卷的完整填写链接，发送时不会自动插入链接。"
        type="warning"
        :closable="false"
        show-icon
      />
      <div class="form-hint">本问卷链接：{{ writeLink }}</div>
      <el-form-item class="send-action">
        <el-button type="primary" icon="el-icon-s-promotion" :loading="sending" @click="sendInvitations"
          >发送短信邀请</el-button
        >
      </el-form-item>
      <el-alert
        v-if="lastResult"
        type="success"
        :closable="false"
        show-icon
        :title="`云信已受理 ${lastResult.recipientCount} 个号码的邀请`"
        :description="`任务 ID：${lastResult.taskId || '未返回'}；批次号：${
          lastResult.msgId || '未返回'
        }。实际送达情况请在云信平台查询。`"
      />
      <el-alert
        v-if="sendError"
        type="error"
        :closable="false"
        show-icon
        :title="sendError"
        description="若发生超时或连接异常，请先到云信平台核实是否已受理，避免重复发送。"
      />
    </el-form>
  </div>
</template>

<script>
import { getFormSmsConfigRequest, sendFormSmsInviteRequest } from '@/api/project/sms'

export default {
  name: 'SmsInvite',
  props: {
    formKey: { type: String, required: true },
    writeLink: { type: String, required: true }
  },
  data() {
    return {
      loading: false,
      enabled: false,
      sending: false,
      configError: '',
      sendError: '',
      lastResult: null,
      variableTemplate: true,
      form: { templateId: '', phones: '', variables: [this.formKey] }
    }
  },
  computed: {
    phoneTokens() {
      return this.form.phones
        .trim()
        .split(/[\s,，;；]+/)
        .filter(Boolean)
    },
    phoneNumbers() {
      return [...new Set(this.phoneTokens)]
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      this.loading = true
      this.configError = ''
      try {
        const res = await getFormSmsConfigRequest(this.formKey)
        this.enabled = res.data.enabled
        this.form.templateId = res.data.templateId || ''
      } catch (e) {
        this.configError = '短信配置加载失败，请重试'
      } finally {
        this.loading = false
      }
    },
    validatePhones(rule, value, callback) {
      if (!this.phoneNumbers.length) return callback(new Error('请输入收件人手机号'))
      if (this.phoneTokens.length > 100) return callback(new Error('每次最多输入 100 个号码'))
      if (this.phoneNumbers.some((phone) => !/^1[3-9][0-9]{9}$/.test(phone)))
        return callback(new Error('包含无效号码，请检查所有号码是否为 11 位手机号'))
      callback()
    },
    validateVariable(rule, value, callback) {
      if (!value || !value.trim() || [...value].length > 20) return callback(new Error('变量须为 1 至 20 个字符'))
      callback()
    },
    sendInvitations() {
      if (this.sending) return
      this.$refs.inviteForm.validate(async (valid) => {
        if (!valid) return
        this.sending = true
        try {
          await this.$confirm(
            `将向 ${this.phoneNumbers.length} 个号码发送问卷邀请，请确认模板中的链接指向本问卷。`,
            '发送短信邀请',
            {
              confirmButtonText: '确认发送',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch (e) {
          this.sending = false
          return
        }
        this.lastResult = null
        this.sendError = ''
        const templateParams = {}
        if (this.variableTemplate)
          this.form.variables.forEach((value, index) => {
            templateParams[`p${index + 1}`] = value
          })
        try {
          const res = await sendFormSmsInviteRequest({
            formKey: this.formKey,
            templateId: this.form.templateId.trim(),
            phoneNumbers: this.phoneNumbers,
            templateParams
          })
          this.lastResult = res.data
        } catch (e) {
          this.sendError = e.msg || e.message || '短信发送未完成，请先在云信平台核实任务状态'
        } finally {
          this.sending = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sms-invite-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 30px;
  margin: 24px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #1e293b;
  }
  .card-header i {
    color: #3b82f6;
    font-size: 24px;
  }
  h3 {
    margin: 0;
    font-size: 20px;
  }
  .card-desc {
    color: #64748b;
    font-size: 14px;
    margin-bottom: 24px;
  }
  .form-hint {
    color: #64748b;
    font-size: 13px;
    margin-top: 8px;
    overflow-wrap: anywhere;
  }
  .el-alert {
    margin-bottom: 20px;
  }
  .variable-actions {
    margin-bottom: 20px;
  }
  .send-action {
    margin-top: 24px;
  }
  .retry-button {
    margin-top: 16px;
  }
}
</style>
