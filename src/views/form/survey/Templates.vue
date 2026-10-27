<template>
  <div class="templates-page" v-loading="loading">
    <h2>短信模板</h2>
    <p class="hint">绑定云信已有模板时，请核对完整正文。新模板可直接申请，审核通过后才能发送。</p>
    <el-alert v-if="capabilities.reason" :title="capabilities.reason" type="info" :closable="false" />
    <el-alert
      v-if="!capabilities.enabled || !capabilities.templateCreate"
      title="当前不能提交新模板：请管理员在系统配置→短信配置中开启“启用调研邀请”和“文本模板申请”。"
      type="warning"
      :closable="false"
      show-icon
    />
    <div class="toolbar">
      <el-button type="primary" @click="edit()">新增 / 绑定模板</el-button><el-button @click="load">刷新列表</el-button>
    </div>
    <el-table :data="rows" stripe>
      <el-table-column prop="name" label="名称" min-width="130" />
      <el-table-column prop="providerTemplateId" label="云信模板ID" min-width="130" />
      <el-table-column label="类型" width="90"
        ><template slot-scope="s">{{ s.row.variable ? '变量文本' : '普通文本' }}</template></el-table-column
      >
      <el-table-column label="审核状态" min-width="150"
        ><template slot-scope="s">{{
          audit(s.row).rx_statu || applicationNames[s.row.applicationState] || '未查询'
        }}</template></el-table-column
      >
      <el-table-column label="运营商覆盖" min-width="240"
        ><template slot-scope="s"
          >移动：{{ audit(s.row).cmcc_statu || '未知' }}；联通：{{ audit(s.row).cucc_statu || '未知' }}；电信：{{
            audit(s.row).ctcc_statu || '未知'
          }}</template
        ></el-table-column
      >
      <el-table-column label="共享" width="70"
        ><template slot-scope="s">{{ s.row.shared ? '全局' : '个人' }}</template></el-table-column
      >
      <el-table-column label="操作" width="240"
        ><template slot-scope="s"
          ><el-button type="text" @click="edit(s.row)">查看 / 编辑</el-button
          ><el-button
            v-if="!s.row.providerTemplateId"
            type="text"
            :disabled="!canManage(s.row) || !capabilities.templateCreate || s.row.applicationState !== 'DRAFT'"
            @click="apply(s.row)"
            >提交申请</el-button
          ><el-button
            v-else
            type="text"
            :disabled="!canManage(s.row) || !capabilities.templateStatus"
            @click="refreshAudit(s.row)"
            >查询审核</el-button
          ></template
        ></el-table-column
      >
    </el-table>
    <pagination :total="total" :page.sync="page" :limit.sync="size" @pagination="load" />
    <el-dialog title="短信模板" :visible.sync="open" append-to-body width="880px" :close-on-click-modal="false">
      <el-form label-width="110px" :disabled="!canManage(draft)">
        <el-form-item label="模板名称" required><el-input v-model="draft.name" maxlength="100" /></el-form-item>
        <el-form-item label="云信模板ID"
          ><el-input v-model="draft.providerTemplateId" placeholder="绑定已有模板时填写；申请新模板留空"
        /></el-form-item>
        <el-form-item label="类型"
          ><el-radio-group v-model="draft.variable"
            ><el-radio :label="true">变量文本</el-radio><el-radio :label="false">普通文本</el-radio></el-radio-group
          ></el-form-item
        >
        <el-form-item label="完整正文" required
          ><el-input
            v-model="draft.content"
            type="textarea"
            :rows="5"
            maxlength="10000"
            placeholder="【签名】请填写调查问卷：https://您的公开域名/i/#params_1#"
          />
          <p class="hint">
            保存后需要重新查询审核；本地编辑不会修改云信已审核的正文。已有模板请确保两边一致。
          </p></el-form-item
        >
        <el-form-item label="变量映射"
          ><el-button size="small" @click="syncMappings">从正文识别变量</el-button
          ><el-button size="small" @click="configureFiveParts">连续5变量配置为链接分段</el-button></el-form-item
        >
        <el-table :data="mappings" size="small">
          <el-table-column prop="key" label="变量" width="80" />
          <el-table-column label="来源" width="190"
            ><template slot-scope="s"
              ><el-select v-model="s.row.source"
                ><el-option
                  v-for="option in sources"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value" /></el-select></template
          ></el-table-column>
          <el-table-column label="配置"
            ><template slot-scope="s"
              ><el-input
                v-if="s.row.source === 'FIXED'"
                v-model="s.row.value"
                maxlength="20"
                placeholder="1至20字符"
              /><template v-else-if="s.row.source === 'LINK_PART'"
                >第 <el-input-number v-model="s.row.part" :min="1" :max="30" size="mini" /> 段，共
                <el-input-number v-model="s.row.parts" :min="1" :max="30" size="mini" /> 段</template
              ><span v-else class="hint">发送时自动填入；每值不超过20字符</span></template
            ></el-table-column
          >
        </el-table>
        <el-form-item v-if="capabilities.admin" label="共享范围"
          ><el-checkbox v-model="draft.shared">作为全局共享模板</el-checkbox></el-form-item
        >
      </el-form>
      <el-alert
        v-if="draft.applicationState === 'SUBMISSION_UNKNOWN'"
        title="上次申请结果未知，请先在云信核实后绑定模板ID，避免重复申请。"
        type="warning"
        :closable="false"
      />
      <div slot="footer">
        <el-button @click="open = false">关闭</el-button
        ><el-button v-if="canManage(draft)" type="primary" :loading="saving" @click="save">保存模板</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import {
  getSmsCapabilities,
  listSmsTemplates,
  saveSmsTemplate,
  applySmsTemplate,
  refreshSmsTemplateAudit
} from '@/api/project/sms'
export default {
  name: 'SurveyTemplates',
  components: { Pagination },
  data() {
    return {
      capabilities: {},
      loading: false,
      saving: false,
      rows: [],
      page: 1,
      size: 20,
      total: 0,
      open: false,
      draft: {},
      mappings: [],
      applicationNames: {
        DRAFT: '本地草稿',
        BOUND: '已绑定，待核对',
        SUBMITTING: '申请中',
        APPLIED: '已申请，待审核',
        SUBMISSION_UNKNOWN: '申请结果未知'
      },
      sources: [
        { value: 'INVITE_TOKEN', label: '邀请标识（推荐）' },
        { value: 'INVITE_LINK', label: '完整邀请链接' },
        { value: 'LINK_PART', label: '链接分段' },
        { value: 'FORM_KEY', label: '问卷编号' },
        { value: 'FORM_NAME', label: '问卷名称' },
        { value: 'NAME', label: '联系人姓名' },
        { value: 'COMPANY', label: '联系人单位' },
        { value: 'FIXED', label: '固定文字' }
      ]
    }
  },
  created() {
    getSmsCapabilities().then((r) => {
      this.capabilities = r.data
    })
    this.load()
  },
  methods: {
    canManage(row) {
      return !row.id || this.capabilities.admin || String(row.ownerId) === String(this.capabilities.userId)
    },
    async load() {
      this.loading = true
      try {
        const r = await listSmsTemplates({ page: this.page, size: this.size })
        this.rows = r.data.records
        this.total = r.data.total
      } finally {
        this.loading = false
      }
    },
    audit(row) {
      try {
        return JSON.parse(row.auditJson || '{}')
      } catch (e) {
        return {}
      }
    },
    edit(row) {
      this.draft = row
        ? { ...row }
        : {
            name: '',
            providerTemplateId: null,
            variable: true,
            content: '【签名】请填写调查问卷：https://您的公开域名/i/#params_1#',
            shared: false,
            mappingJson: '{"p1":{"source":"INVITE_TOKEN"}}'
          }
      const mapping = JSON.parse(this.draft.mappingJson || '{}')
      this.mappings = Object.keys(mapping).map((key) => ({ key, ...mapping[key] }))
      this.open = true
    },
    syncMappings() {
      const keys = [
        ...new Set(
          (this.draft.content.match(/#params_([1-9]|[12][0-9]|30)#/g) || []).map((v) => 'p' + v.match(/\d+/)[0])
        )
      ]
      this.mappings = keys.map(
        (key) =>
          this.mappings.find((v) => v.key === key) || { key, source: 'INVITE_TOKEN', value: '', part: 1, parts: 1 }
      )
    },
    configureFiveParts() {
      this.syncMappings()
      if (this.mappings.length !== 5) return this.msgError('正文须包含5个连续链接变量')
      this.mappings = this.mappings.map((row, i) => ({ ...row, source: 'LINK_PART', part: i + 1, parts: 5 }))
    },
    async save() {
      this.saving = true
      try {
        const mapping = {}
        this.mappings.forEach(({ key, ...rule }) => {
          mapping[key] = rule
        })
        await saveSmsTemplate({
          ...this.draft,
          providerTemplateId: this.draft.providerTemplateId || null,
          mappingJson: JSON.stringify(mapping)
        })
        this.open = false
        this.msgSuccess('已保存，请查询审核后使用')
        await this.load()
      } finally {
        this.saving = false
      }
    },
    async apply(row) {
      await this.$confirm('将向云信申请此文本模板，正文须与签名及实际用途一致。', '申请模板')
      this.loading = true
      try {
        await applySmsTemplate(row.id)
        this.msgSuccess('申请已受理')
        await this.load()
      } finally {
        this.loading = false
      }
    },
    async refreshAudit(row) {
      this.loading = true
      try {
        await refreshSmsTemplateAudit(row.id)
        await this.load()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>
.templates-page {
  padding: 24px;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: white;
}
.toolbar {
  margin: 16px 0;
}
.hint {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}
</style>
