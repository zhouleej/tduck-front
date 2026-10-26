<template>
  <div>
    <el-divider>问卷调研邀请</el-divider>
    <el-form-item label="启用调研邀请"><el-switch v-model="form.surveyEnabled" /></el-form-item>
    <el-form-item label="问卷公开根地址"><el-input v-model="form.surveyPublicBaseUrl" placeholder="https://survey.example.com" /><div class="form-hint">手机可访问的问卷域名，不可使用localhost。邀请链接统一使用此地址。</div></el-form-item>
    <el-form-item label="本地发送时段（北京时间）"><el-input-number v-model="form.surveySendStartHour" :min="0" :max="23" /> 至 <el-input-number v-model="form.surveySendEndHour" :min="1" :max="24" /></el-form-item>
    <el-form-item label="网关分片请求最小间隔（秒）"><el-input-number v-model="form.surveySendIntervalSeconds" :min="1" :max="60" /></el-form-item>
    <el-form-item label="开放能力（完成正式接口验证后开启）">
      <el-checkbox v-model="form.yunxinTemplateCreateEnabled">文本模板申请</el-checkbox><el-checkbox v-model="form.yunxinTemplateStatusEnabled">审核查询</el-checkbox><el-checkbox v-model="form.yunxinReceiptEnabled">回执查询</el-checkbox><el-checkbox v-model="form.yunxinUpstreamEnabled">上行回复</el-checkbox>
    </el-form-item>
    <el-collapse>
      <el-collapse-item title="正式查询协议参数" name="protocol">
        <p class="form-hint">只填写实际联调确认的值。系统不会自动猜测或切换参数，也不会调用网页登录接口。</p>
        <el-form-item label="任务查询起始字段"><el-select v-model="form.yunxinQueryStartField"><el-option label="startTime" value="startTime" /><el-option label="beginTime" value="beginTime" /></el-select></el-form-item>
        <el-form-item label="任务查询时间格式"><el-select v-model="form.yunxinQueryTimeFormat"><el-option label="yyyy-MM-dd HH:mm:ss" value="yyyy-MM-dd HH:mm:ss" /><el-option label="yyyyMMdd HH:mm:ss" value="yyyyMMdd HH:mm:ss" /></el-select></el-form-item>
        <el-form-item label="任务查询成功码"><el-input v-model="form.yunxinQuerySuccessCode" placeholder="未验证时留空，禁止回执查询" /></el-form-item>
        <el-form-item label="审核查询成功码"><el-input v-model="form.yunxinAuditSuccessCode" /></el-form-item>
        <el-form-item label="上行查询成功码"><el-input v-model="form.yunxinUpstreamSuccessCode" /></el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  name: 'SurveySmsConfig', props: { form: { type: Object, required: true } },
  created() { const defaults = { surveyEnabled: false, surveyPublicBaseUrl: '', surveySendStartHour: 8, surveySendEndHour: 20, surveySendIntervalSeconds: 1, yunxinTemplateCreateEnabled: false, yunxinTemplateStatusEnabled: false, yunxinReceiptEnabled: false, yunxinUpstreamEnabled: false, yunxinQueryStartField: 'startTime', yunxinQueryTimeFormat: 'yyyy-MM-dd HH:mm:ss', yunxinQuerySuccessCode: '', yunxinAuditSuccessCode: '200', yunxinUpstreamSuccessCode: '200' }; Object.keys(defaults).forEach((key) => { if (this.form[key] === undefined) this.$set(this.form, key, defaults[key]) }) }
}
</script>
