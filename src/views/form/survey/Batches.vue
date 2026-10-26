<template>
  <div class="batches-page" v-loading="loading">
    <h2>短信邀请与跟进</h2>
    <el-alert
      :title="
        capabilities.reason ||
        (settings.mode === 'TRACKED'
          ? '跟踪模式：按邀请链接查看填写进度，并可人工催答。'
          : '匿名模式：仅关联来源批次，无法识别某个收件人是否已填写。')
      "
      type="info"
      :closable="false"
      show-icon
    />
    <div class="toolbar">
      <el-button type="primary" :disabled="!capabilities.enabled" @click="compose()">发送邀请</el-button
      ><el-select v-model="query.status" placeholder="全部批次状态" clearable @change="load"
        ><el-option v-for="(label, value) in batchStates" :key="value" :label="label" :value="value" /></el-select
      ><el-button @click="load">刷新</el-button><el-button @click="go('survey')">维护调研对象</el-button
      ><el-button @click="go('sms-templates')">短信模板</el-button>
    </div>
    <el-table :data="rows" stripe>
      <el-table-column prop="id" label="本地批次号" width="100" />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column label="类型" width="100"
        ><template slot-scope="s">{{ kinds[s.row.kind] }}</template></el-table-column
      >
      <el-table-column prop="recipientCount" label="人数" width="80" />
      <el-table-column label="执行状态" width="110"
        ><template slot-scope="s"
          ><el-tag>{{ batchStates[s.row.status] || s.row.status }}</el-tag></template
        ></el-table-column
      >
      <el-table-column prop="scheduledAt" label="执行时间（北京时间）" min-width="180" />
      <el-table-column prop="reason" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="270"
        ><template slot-scope="s"
          ><el-button type="text" @click="detail(s.row)">详情</el-button
          ><el-button v-if="s.row.status === 'PAUSED'" type="text" @click="action(s.row, 'resume')">继续</el-button
          ><el-button v-if="['PENDING', 'RUNNING'].includes(s.row.status)" type="text" @click="action(s.row, 'pause')"
            >暂停</el-button
          ><el-button
            v-if="['PENDING', 'RUNNING', 'PAUSED'].includes(s.row.status)"
            type="text"
            @click="action(s.row, 'cancel')"
            >取消</el-button
          ><el-button type="text" @click="compose(s.row.mode === 'TRACKED' ? 'REMINDER' : 'REINVITE', s.row)">{{
            s.row.mode === 'TRACKED' ? '催答' : '再次邀请'
          }}</el-button></template
        ></el-table-column
      >
    </el-table>
    <pagination :total="total" :page.sync="query.page" :limit.sync="query.size" @pagination="load" />

    <el-dialog
      :title="kinds[form.kind] || '发送邀请'"
      :visible.sync="composeOpen"
      append-to-body
      width="850px"
      :close-on-click-modal="false"
    >
      <el-form label-width="110px">
        <el-form-item label="批次名称"><el-input v-model="form.name" maxlength="100" /></el-form-item>
        <el-form-item label="短信模板" required
          ><el-select v-model="form.templateId" filterable placeholder="请选择已审核模板"
            ><el-option
              v-for="t in templates"
              :key="t.id"
              :label="`${t.name}（${t.providerTemplateId || '未申请'}）`"
              :value="t.id" /></el-select
        ></el-form-item>
        <el-form-item label="选择对象"
          ><el-radio-group v-model="selection"
            ><el-radio label="all">按分组 / 单位选择</el-radio
            ><el-radio label="specific">选择具体联系人</el-radio></el-radio-group
          ></el-form-item
        >
        <template v-if="selection === 'all'"
          ><el-form-item label="分组"><el-input v-model="form.groupName" placeholder="留空表示全部分组" /></el-form-item
          ><el-form-item label="单位"><el-input v-model="form.company" placeholder="留空表示全部单位" /></el-form-item
        ></template>
        <el-form-item v-else label="联系人"
          ><el-select
            v-model="form.recipientIds"
            multiple
            filterable
            remote
            :remote-method="findRecipients"
            :loading="finding"
            placeholder="搜索号码、姓名或单位"
            style="width: 100%"
            ><el-option
              v-for="r in recipientOptions"
              :key="r.id"
              :value="r.id"
              :label="`${r.name || r.company || '联系人'} ${r.phone}`" /></el-select
        ></el-form-item>
        <el-form-item v-if="form.kind === 'REMINDER'" label="填写筛选"
          ><el-select v-model="form.participation"
            ><el-option label="全部未完成" value="NOT_COMPLETED" /><el-option
              label="未访问"
              value="NOT_VISITED" /><el-option label="已访问未完成" value="VISITED" /></el-select
        ></el-form-item>
        <el-form-item label="执行时间"
          ><el-radio-group v-model="sendWhen"
            ><el-radio label="now">立即进入发送队列</el-radio
            ><el-radio label="scheduled">预约发送</el-radio></el-radio-group
          ><el-date-picker
            v-if="sendWhen === 'scheduled'"
            v-model="form.scheduledAt"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="北京时间"
        /></el-form-item>
      </el-form>
      <p class="hint">
        默认北京时间 {{ capabilities.sendStartHour }}—{{ capabilities.sendEndHour }}
        时执行；每批最多1万人。停用、拒收、24小时内已发送及存在待处理记录的对象会排除；催答还会排除已完成者。
      </p>
      <el-alert
        v-if="form.kind === 'REINVITE'"
        title="匿名模式无法排除已匿名填写者，请核对再次邀请范围。"
        type="warning"
        :closable="false"
      />
      <el-button :disabled="!form.templateId" :loading="previewing" @click="previewBatch">预览并检查</el-button>
      <div v-if="preview" class="preview">
        <p>
          选择 {{ preview.total }} 人，可发送 {{ preview.eligible }} 人；变量异常 {{ preview.invalidVariables }} 人。
        </p>
        <p v-for="(count, reason) in preview.excluded" :key="reason" class="hint">{{ reason }}：{{ count }} 人</p>
        <el-alert
          v-if="!preview.approved"
          title="模板尚未通过审核，请到模板管理查询审核。"
          type="error"
          :closable="false"
        />
        <el-table
          v-if="preview.invalidSamples && preview.invalidSamples.length"
          :data="preview.invalidSamples"
          size="mini"
          max-height="180"
          ><el-table-column prop="phone" label="变量异常号码" width="150" /><el-table-column
            prop="reason"
            label="需要修正的资料 / 映射"
        /></el-table>
        <div v-for="(sample, index) in preview.samples" :key="index" class="message-preview">
          <strong>{{ sample.phone }}</strong>
          <p>{{ sample.content }}</p>
          <span class="hint">示例链接：{{ sample.link }}；正式创建时生成实际标识。</span>
        </div>
        <el-checkbox v-if="!preview.allCarriersApproved" v-model="coverageAccepted"
          >已核对运营商覆盖（移动 {{ preview.audit.cmcc_statu || '未知' }} / 联通
          {{ preview.audit.cucc_statu || '未知' }} / 电信 {{ preview.audit.ctcc_statu || '未知' }}）</el-checkbox
        >
        <el-checkbox v-if="!preview.hasInvitationLink && preview.mode === 'ANONYMOUS'" v-model="untrackedAccepted"
          >固定正文未含批次邀请链接，接受该批次无法统计访问和回收归因</el-checkbox
        >
        <el-alert
          v-if="!preview.hasInvitationLink && preview.mode === 'TRACKED'"
          title="模板未包含完整专属邀请链接，跟踪模式不能发送。"
          type="error"
          :closable="false"
        />
      </div>
      <div slot="footer">
        <el-button @click="composeOpen = false">取消</el-button
        ><el-button type="primary" :loading="creating" :disabled="!canCreate" @click="create">确认创建批次</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="current ? `批次 ${current.id} · ${current.name}` : '邀请明细'"
      :visible.sync="detailOpen"
      append-to-body
      width="95%"
    >
      <template v-if="current">
        <p class="hint">
          {{ current.reason }}；提交受理、网关发送、手机送达与填写进度分别展示。执行结束不代表全部送达。
        </p>
        <div class="toolbar">
          <el-input v-model="deliveryQuery.keyword" placeholder="号码、姓名或单位" clearable /><el-select
            v-model="deliveryQuery.submitStatus"
            placeholder="全部受理状态"
            clearable
            ><el-option v-for="(label, value) in submitStates" :key="value" :label="label" :value="value" /></el-select
          ><el-select v-model="deliveryQuery.deliveryStatus" placeholder="全部送达状态" clearable
            ><el-option
              v-for="(label, value) in deliveryStates"
              :key="value"
              :label="label"
              :value="value" /></el-select
          ><el-select
            v-if="current.mode === 'TRACKED'"
            v-model="deliveryQuery.participation"
            placeholder="全部填写状态"
            clearable
            ><el-option label="已完成" value="COMPLETED" /><el-option label="未完成" value="NOT_COMPLETED" /><el-option
              label="未访问"
              value="NOT_VISITED" /><el-option label="已访问未完成" value="VISITED" /></el-select
          ><el-button @click="searchDeliveries">筛选</el-button
          ><el-button :disabled="!capabilities.receipt" :loading="syncing" @click="sync">刷新云信回执</el-button
          ><el-button @click="exportDetails">导出筛选结果</el-button
          ><el-button @click="compose('RETRY', current)">再次发送明确失败对象</el-button>
        </div>
        <el-table :data="deliveryRows" v-loading="detailsLoading" max-height="480" stripe>
          <el-table-column prop="id" label="明细号" width="90" /><el-table-column
            prop="phone"
            label="手机号"
            min-width="130"
          /><el-table-column prop="name" label="姓名" min-width="90" /><el-table-column
            prop="company"
            label="单位"
            min-width="130"
          />
          <el-table-column label="受理" min-width="110"
            ><template slot-scope="s">{{
              submitStates[s.row.submitStatus] || s.row.submitStatus
            }}</template></el-table-column
          >
          <el-table-column label="发送" min-width="90"
            ><template slot-scope="s">{{ sendStates[s.row.sendStatus] || s.row.sendStatus }}</template></el-table-column
          >
          <el-table-column label="送达" min-width="110"
            ><template slot-scope="s">{{
              deliveryStates[s.row.deliveryStatus] || s.row.deliveryStatus
            }}</template></el-table-column
          >
          <el-table-column v-if="current.mode === 'TRACKED'" label="填写" min-width="100"
            ><template slot-scope="s"
              >{{ participationStates[s.row.participation]
              }}<el-button v-if="s.row.participation === 'COMPLETED'" type="text" @click="answers(s.row)"
                >答卷</el-button
              ></template
            ></el-table-column
          >
          <el-table-column v-if="capabilities.admin" label="核实" width="90"
            ><template slot-scope="s"
              ><el-button v-if="s.row.submitStatus === 'UNKNOWN'" type="text" @click="resolve(s.row)"
                >核实受理</el-button
              ></template
            ></el-table-column
          ><el-table-column prop="reason" label="原因 / 说明" min-width="230" show-overflow-tooltip /><el-table-column
            prop="providerTaskId"
            label="云信任务号"
            min-width="110"
          /><el-table-column prop="submittedAt" label="提交时间" min-width="170" /><el-table-column
            prop="syncedAt"
            label="最近同步"
            min-width="170"
          />
        </el-table>
        <pagination
          :total="deliveryTotal"
          :page.sync="deliveryQuery.page"
          :limit.sync="deliveryQuery.size"
          @pagination="loadDeliveries"
        />
      </template>
    </el-dialog>
    <el-dialog title="通过邀请链接提交的答卷" :visible.sync="answersOpen" append-to-body width="750px"
      ><el-button v-for="answer in answerRows" :key="answer.id" size="small" @click="showAnswer(answer.id)"
        >答卷 {{ answer.id }} · {{ answer.create_time || answer.createTime }}</el-button
      ><view-data v-if="answerModel" :fields="answerFields" :page-form-model="answerModel"
    /></el-dialog>
    <el-dialog title="人工核实受理结果" :visible.sync="resolutionOpen" append-to-body width="620px"
      ><p class="hint">管理员须先在云信核实，此操作只记录核实结果，不会发送短信。</p>
      <el-select v-model="resolution.outcome"
        ><el-option label="已确认受理" value="ACCEPTED" /><el-option
          label="已确认未受理"
          value="NOT_ACCEPTED" /></el-select
      ><el-input
        v-if="resolution.outcome === 'ACCEPTED'"
        v-model="resolution.taskId"
        placeholder="已核实的云信任务号"
      /><el-input v-model="resolution.evidence" type="textarea" maxlength="500" placeholder="核实依据" />
      <div slot="footer">
        <el-button @click="resolutionOpen = false">取消</el-button
        ><el-button type="primary" @click="confirmResolution">保存核实结果</el-button>
      </div></el-dialog
    >
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import ViewData from '@/views/form/data/ViewData.vue'
import { getSurveySettings, listRecipients } from '@/api/project/survey'
import {
  getSmsCapabilities,
  listSmsTemplates,
  previewSmsBatch,
  createSmsBatch,
  listSmsBatches,
  getSmsBatch,
  listSmsDeliveries,
  actSmsBatch,
  syncSmsBatch,
  getRecipientAnswers,
  exportSmsDeliveries,
  previewSmsReminder,
  createSmsReminder,
  resolveSmsSubmission
} from '@/api/project/sms'
import { getFormDataDetailsRequest } from '@/api/project/data'
import { listFormFieldsRequest } from '@/api/project/form'
const key = () => {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
}
export default {
  name: 'SurveyBatches',
  components: { Pagination, ViewData },
  data() {
    return {
      formKey: this.$route.query.key,
      capabilities: {},
      settings: {},
      templates: [],
      rows: [],
      total: 0,
      query: { page: 1, size: 20, status: '' },
      loading: false,
      composeOpen: false,
      form: {},
      selection: 'all',
      sendWhen: 'now',
      recipientOptions: [],
      finding: false,
      preview: null,
      previewing: false,
      creating: false,
      coverageAccepted: false,
      untrackedAccepted: false,
      requestKey: key(),
      detailOpen: false,
      current: null,
      deliveryRows: [],
      deliveryTotal: 0,
      deliveryQuery: { page: 1, size: 20, keyword: '', submitStatus: '', deliveryStatus: '', participation: '' },
      detailsLoading: false,
      syncing: false,
      resolutionOpen: false,
      resolution: {},
      refreshTimer: null,
      answersOpen: false,
      answerRows: [],
      answerFields: [],
      answerModel: null,
      batchStates: {
        PENDING: '待执行',
        RUNNING: '发送中',
        PAUSED: '已暂停',
        COMPLETED: '执行结束',
        CANCELED: '已取消待发'
      },
      kinds: { INVITE: '首次邀请', REMINDER: '人工催答', RETRY: '失败再次发送', REINVITE: '再次邀请' },
      submitStates: {
        PENDING: '待发送',
        SUBMITTING: '提交中',
        ACCEPTED: '已受理',
        REJECTED: '明确拒绝',
        UNKNOWN: '结果未知',
        SKIPPED: '已排除',
        CANCELED: '已取消'
      },
      sendStates: { PENDING: '待处理', SUCCESS: '发送成功', FAILED: '发送失败', UNKNOWN: '未知' },
      deliveryStates: {
        WAITING: '等待回执',
        SUCCESS: '送达成功',
        FAILED: '送达失败',
        UNKNOWN: '未知',
        TIMEOUT: '超时未确认',
        NOT_SENT: '未发送'
      },
      participationStates: { NOT_VISITED: '未访问', VISITED: '已访问未完成', COMPLETED: '已完成' }
    }
  },
  computed: {
    canCreate() {
      return (
        this.preview &&
        this.capabilities.enabled &&
        this.preview.approved &&
        this.preview.eligible > 0 &&
        this.preview.invalidVariables === 0 &&
        (this.preview.allCarriersApproved || this.coverageAccepted) &&
        (this.preview.hasInvitationLink || (this.preview.mode === 'ANONYMOUS' && this.untrackedAccepted)) &&
        (this.sendWhen !== 'scheduled' || this.form.scheduledAt)
      )
    }
  },
  watch: {
    detailOpen(value) {
      clearInterval(this.refreshTimer)
      if (value)
        this.refreshTimer = setInterval(() => {
          if (!this.detailsLoading) this.loadDeliveries()
        }, 10000)
    },
    form: {
      deep: true,
      handler() {
        this.preview = null
        this.requestKey = key()
        this.coverageAccepted = false
        this.untrackedAccepted = false
      }
    },
    selection() {
      this.preview = null
      this.requestKey = key()
    },
    sendWhen() {
      this.preview = null
      this.requestKey = key()
    }
  },
  async created() {
    const results = await Promise.all([getSmsCapabilities(), getSurveySettings(this.formKey)])
    this.capabilities = results[0].data
    this.settings = results[1].data
    this.load()
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer)
  },
  methods: {
    go(page) {
      this.$router.push({ path: `/project/form/${page}`, query: { key: this.formKey } })
    },
    async load() {
      this.loading = true
      try {
        const r = await listSmsBatches({ ...this.query, formKey: this.formKey })
        this.rows = r.data.records
        this.total = r.data.total
      } finally {
        this.loading = false
      }
    },
    async compose(kind = 'INVITE', source) {
      this.templates = (await listSmsTemplates({ page: 1, size: 100 })).data.records
      this.settings = (await getSurveySettings(this.formKey)).data
      this.form = {
        formKey: this.formKey,
        name: kind === 'INVITE' ? '问卷邀请' : this.kinds[kind],
        kind,
        templateId: source ? source.templateId : this.settings.defaultTemplateId || null,
        sourceBatchId: source ? source.id : null,
        recipientIds: [],
        groupName: '',
        company: '',
        participation: kind === 'REMINDER' ? 'NOT_COMPLETED' : '',
        scheduledAt: null
      }
      this.selection = 'all'
      this.sendWhen = 'now'
      this.preview = null
      this.requestKey = key()
      this.composeOpen = true
    },
    payload() {
      return {
        ...this.form,
        recipientIds: this.selection === 'specific' ? this.form.recipientIds : null,
        groupName: this.selection === 'all' ? this.form.groupName : '',
        company: this.selection === 'all' ? this.form.company : '',
        scheduledAt: this.sendWhen === 'scheduled' ? this.form.scheduledAt : null
      }
    },
    async findRecipients(keyword) {
      this.finding = true
      try {
        this.recipientOptions = (
          await listRecipients({ formKey: this.formKey, keyword, size: 100, page: 1, disabled: false })
        ).data.records
      } finally {
        this.finding = false
      }
    },
    async previewBatch() {
      this.previewing = true
      try {
        this.preview = (
          await (['REMINDER', 'REINVITE'].includes(this.form.kind) && this.form.sourceBatchId
            ? previewSmsReminder(this.form.sourceBatchId, this.payload())
            : previewSmsBatch(this.payload()))
        ).data
      } finally {
        this.previewing = false
      }
    },
    async create() {
      this.creating = true
      try {
        const data = {
          ...this.payload(),
          requestKey: this.requestKey,
          expectedTemplateVersion: this.preview.templateVersion,
          recipientIds: this.preview.eligibleIds,
          expectedSelectionHash: this.preview.selectionHash,
          coverageAccepted: this.coverageAccepted,
          untrackedAccepted: this.untrackedAccepted
        }
        const r = await (['REMINDER', 'REINVITE'].includes(this.form.kind) && this.form.sourceBatchId
          ? createSmsReminder(this.form.sourceBatchId, data)
          : createSmsBatch(data))
        this.composeOpen = false
        this.msgSuccess(`已创建批次 ${r.data.id}，可在记录中跟踪执行`)
        await this.load()
        await this.detail(r.data)
      } finally {
        this.creating = false
      }
    },
    async action(row, action) {
      const messages = {
        cancel: '取消尚未提交的号码；已提交云信的短信无法撤回。',
        pause: '暂停本地待发送队列；已提交云信的短信不受影响。',
        resume: '请确认问卷、模板及当前发送配置，继续剩余待发送号码。'
      }
      await this.$confirm(messages[action], '确认操作')
      await actSmsBatch(row.id, action)
      await this.load()
      if (this.current && this.current.id === row.id) this.current = (await getSmsBatch(row.id)).data
    },
    async detail(row) {
      this.current = (await getSmsBatch(row.id)).data
      this.deliveryQuery = { page: 1, size: 20, keyword: '', submitStatus: '', deliveryStatus: '', participation: '' }
      this.detailOpen = true
      await this.loadDeliveries()
    },
    searchDeliveries() {
      this.deliveryQuery.page = 1
      this.loadDeliveries()
    },
    async loadDeliveries() {
      this.detailsLoading = true
      try {
        const r = await listSmsDeliveries(this.current.id, this.deliveryQuery)
        this.deliveryRows = r.data.records
        this.deliveryTotal = r.data.total
      } finally {
        this.detailsLoading = false
      }
    },
    async sync() {
      this.syncing = true
      try {
        await syncSmsBatch(this.current.id)
        this.msgSuccess('已安排回执同步，稍后自动刷新明细；未知结果不会自动重发')
        await this.loadDeliveries()
      } finally {
        this.syncing = false
      }
    },
    async exportDetails() {
      const r = await exportSmsDeliveries(this.current.id, this.deliveryQuery)
      this.download(r, `邀请明细-${this.current.id}`)
    },
    async answers(row) {
      this.answerModel = null
      this.answerRows = (await getRecipientAnswers(this.formKey, row.recipientId)).data
      this.answerFields = (await listFormFieldsRequest(this.formKey)).data
      this.answersOpen = true
    },
    resolve(row) {
      this.resolution = { id: row.id, outcome: 'NOT_ACCEPTED', taskId: '', evidence: '' }
      this.resolutionOpen = true
    },
    async confirmResolution() {
      await resolveSmsSubmission(this.resolution.id, this.resolution)
      this.resolutionOpen = false
      this.loadDeliveries()
    },
    async showAnswer(id) {
      const r = await getFormDataDetailsRequest(id)
      this.answerFields = r.data.formFields || this.answerFields
      this.answerModel = r.data.formData || r.data.originalData || r.data
    }
  }
}
</script>
<style scoped>
.batches-page {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  background: white;
}
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 0;
}
.toolbar .el-input {
  width: 180px;
}
.toolbar .el-select {
  width: 150px;
}
.hint {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
}
.preview {
  margin-top: 16px;
}
.message-preview {
  background: #f7f8fa;
  padding: 14px;
  margin: 12px 0;
  border-radius: 8px;
  word-break: break-all;
}
.preview .el-checkbox {
  display: block;
  white-space: normal;
  margin: 14px 0;
}
</style>
