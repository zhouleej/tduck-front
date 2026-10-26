<template>
  <el-card class="sms-invite-card" shadow="never">
    <h3>短信邀请调研对象</h3>
    <p>从调研名单选择对象，预览邀请内容并立即或预约发送。发送记录、回执和人工催答统一在短信邀请中管理。</p>
    <el-button type="primary" icon="el-icon-message" @click="open">管理短信邀请</el-button>
  </el-card>
</template>
<script>
export default {
  name: 'SmsInvite',
  props: { formKey: { type: String, required: true }, writeLink: { type: String, default: '' } },
  methods: {
    open() {
      this.$router.push({ path: '/project/form/sms-invitations', query: { key: this.formKey } })
    }
  }
}
</script>
<style scoped>
.sms-invite-card {
  margin: 24px 0;
}
.sms-invite-card p {
  color: #6b7280;
  line-height: 1.8;
}
</style>
