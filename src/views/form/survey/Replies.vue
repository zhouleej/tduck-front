<template>
  <div class="replies-page" v-loading="loading">
    <h2>短信回复与联系偏好</h2>
    <el-alert
      title="回复不一定携带问卷标识。全账户回复由管理员核对后分配，问卷操作人只能查看已明确归属的回复。"
      type="info"
      :closable="false"
    />
    <el-tabs v-model="tab" @tab-click="search">
      <el-tab-pane label="回复收件箱" name="replies">
        <div class="toolbar">
          <el-checkbox v-if="capabilities.admin" v-model="allAccount" @change="search">查看全账户回复</el-checkbox
          ><el-input v-model="query.keyword" placeholder="号码或回复内容" clearable /><el-select
            v-model="query.state"
            placeholder="全部处理状态"
            clearable
            ><el-option label="未处理" value="UNHANDLED" /><el-option label="已处理" value="HANDLED" /></el-select
          ><el-button @click="search">查询</el-button
          ><el-button v-if="capabilities.admin" :disabled="!capabilities.upstream" @click="sync">同步回复</el-button
          ><el-button @click="downloadReplies">导出回复</el-button>
        </div>
        <el-table :data="rows" stripe
          ><el-table-column prop="phone" label="手机号" min-width="130" /><el-table-column
            prop="content"
            label="回复内容"
            min-width="240"
            show-overflow-tooltip
          /><el-table-column prop="recvTime" label="回复时间" min-width="170" /><el-table-column
            prop="assignedFormKey"
            label="归属问卷"
            min-width="120"
          /><el-table-column label="处理状态" width="100"
            ><template slot-scope="s">{{ s.row.state === 'HANDLED' ? '已处理' : '未处理' }}</template></el-table-column
          ><el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip /><el-table-column
            label="操作"
            width="220"
            ><template slot-scope="s"
              ><el-button v-if="capabilities.admin" type="text" @click="assign(s.row)">分配</el-button
              ><el-button type="text" @click="process(s.row)">处理</el-button
              ><el-button v-if="capabilities.admin" type="text" @click="suppress(s.row.phone, true)"
                >设置拒收</el-button
              ></template
            ></el-table-column
          ></el-table
        >
      </el-tab-pane>
      <el-tab-pane v-if="capabilities.admin" label="本地拒收" name="suppressions">
        <p class="hint">对当前云信账户的后续邀请统一生效；停用拒收记录后才恢复联系。不会修改云信平台黑名单。</p>
        <div class="toolbar">
          <el-input v-model="suppressionPhone" placeholder="手机号" /><el-button @click="load">查询</el-button
          ><el-button @click="addSuppression">新增拒收</el-button>
        </div>
        <el-table :data="rows" stripe
          ><el-table-column prop="phone" label="手机号" /><el-table-column
            prop="reason"
            label="依据"
            min-width="220"
          /><el-table-column label="状态"
            ><template slot-scope="s">{{ s.row.active ? '拒收中' : '已恢复联系' }}</template></el-table-column
          ><el-table-column label="操作"
            ><template slot-scope="s"
              ><el-button type="text" @click="suppress(s.row.phone, !s.row.active)">{{
                s.row.active ? '恢复联系' : '重新拒收'
              }}</el-button></template
            ></el-table-column
          ></el-table
        >
      </el-tab-pane>
      <el-tab-pane v-if="capabilities.admin" label="待核对回执" name="receipts">
        <p class="hint">没有完整号码、存在多次发送或匹配歧义的回执保留在此。人工关联仍须核对账户、任务及完整号码。</p>
        <el-table :data="rows" stripe
          ><el-table-column prop="id" label="回执记录" width="100" /><el-table-column
            prop="phone"
            label="号码"
          /><el-table-column prop="providerTaskId" label="云信任务" /><el-table-column
            prop="sendTime"
            label="发送时间"
            min-width="170"
          /><el-table-column label="关联状态"
            ><template slot-scope="s">{{
              { UNMATCHED: '未关联', UNUSABLE: '缺少关联字段', AMBIGUOUS: '需要人工核对' }[s.row.matchState] ||
              s.row.matchState
            }}</template></el-table-column
          ><el-table-column prop="matchReason" label="说明" min-width="240" /><el-table-column label="操作"
            ><template slot-scope="s"
              ><el-button type="text" @click="linkReceipt(s.row)">核对并关联</el-button></template
            ></el-table-column
          ></el-table
        >
      </el-tab-pane>
      <el-tab-pane v-if="capabilities.admin" label="同步运行情况" name="health"
        ><el-button @click="load">刷新</el-button
        ><el-table :data="rows"
          ><el-table-column label="同步类型"
            ><template slot-scope="s">{{
              s.row.kind === 'RECEIPT' ? '送达回执' : s.row.kind === 'UPSTREAM' ? '用户回复' : s.row.kind
            }}</template></el-table-column
          ><el-table-column prop="sourceKey" label="来源" /><el-table-column
            prop="pageNum"
            label="当前页" /><el-table-column prop="failures" label="连续失败" /><el-table-column
            prop="nextPollAt"
            label="下次同步"
            min-width="170" /><el-table-column prop="lastError" label="说明" min-width="300" /></el-table
      ></el-tab-pane>
    </el-tabs>
    <pagination
      v-if="tab !== 'health'"
      :total="total"
      :page.sync="query.page"
      :limit.sync="query.size"
      @pagination="load"
    />
    <el-dialog title="分配回复归属" :visible.sync="assignOpen" append-to-body width="650px"
      ><p>请选择明确对应的问卷。相同号码可能参与多份调研，候选列表不代表已确认归属。</p>
      <el-select v-model="assignment.formKey" clearable placeholder="留空撤销分配" style="width: 100%"
        ><el-option
          v-for="candidate in candidates"
          :key="candidate.formKey"
          :value="candidate.formKey"
          :label="`${candidate.formName} · ${candidate.name || candidate.company || ''} · ${
            candidate.formKey
          }`" /></el-select
      ><el-button size="small" @click="assignment.formKey = formKey">分配给当前问卷</el-button>
      <div slot="footer">
        <el-button @click="assignOpen = false">取消</el-button
        ><el-button type="primary" @click="confirmAssignment">确认分配</el-button>
      </div></el-dialog
    >
    <el-dialog title="处理回复" :visible.sync="processOpen" append-to-body width="600px"
      ><el-select v-model="processing.state"
        ><el-option label="未处理" value="UNHANDLED" /><el-option label="已处理" value="HANDLED" /></el-select
      ><el-input v-model="processing.note" type="textarea" :rows="4" maxlength="1000" placeholder="处理记录与备注" />
      <div slot="footer">
        <el-button @click="processOpen = false">取消</el-button
        ><el-button type="primary" @click="confirmProcess">保存</el-button>
      </div></el-dialog
    >
    <el-dialog title="人工核对回执" :visible.sync="receiptOpen" append-to-body width="650px"
      ><p class="hint">先在批次详情核对本地明细号、号码、云信任务及时间，再明确关联。</p>
      <pre>{{ receipt.rawJson }}</pre>
      <el-input v-model="receiptAssignment.deliveryId" placeholder="本地邀请明细号" /><el-input
        v-model="receiptAssignment.note"
        type="textarea"
        maxlength="500"
        placeholder="人工核对依据"
      />
      <div slot="footer">
        <el-button @click="receiptOpen = false">取消</el-button
        ><el-button type="primary" @click="confirmReceipt">确认关联</el-button>
      </div></el-dialog
    >
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import {
  getSmsCapabilities,
  listSmsReplies,
  syncSmsReplies,
  listReplyCandidates,
  assignSmsReply,
  processSmsReply,
  listSmsSuppressions,
  saveSmsSuppression,
  listUnmatchedReceipts,
  assignSmsReceipt,
  listSmsSyncHealth,
  exportSmsReplies
} from '@/api/project/sms'
export default {
  name: 'SurveyReplies',
  components: { Pagination },
  data() {
    return {
      formKey: this.$route.query.key,
      capabilities: {},
      tab: 'replies',
      loading: false,
      allAccount: false,
      query: { page: 1, size: 20, keyword: '', state: '' },
      rows: [],
      total: 0,
      suppressionPhone: '',
      assignOpen: false,
      candidates: [],
      assignment: {},
      processOpen: false,
      processing: {},
      receiptOpen: false,
      receipt: {},
      receiptAssignment: {}
    }
  },
  async created() {
    this.capabilities = (await getSmsCapabilities()).data
    this.allAccount = !!this.capabilities.admin
    this.load()
  },
  methods: {
    search() {
      this.query.page = 1
      this.load()
    },
    async load() {
      this.loading = true
      try {
        let r
        if (this.tab === 'replies')
          r = await listSmsReplies({ ...this.query, formKey: this.allAccount ? undefined : this.formKey })
        else if (this.tab === 'suppressions')
          r = await listSmsSuppressions({ page: this.query.page, size: this.query.size, phone: this.suppressionPhone })
        else if (this.tab === 'receipts') r = await listUnmatchedReceipts(this.query)
        else {
          this.rows = (await listSmsSyncHealth()).data
          return
        }
        this.rows = r.data.records
        this.total = r.data.total
      } finally {
        this.loading = false
      }
    },
    async sync() {
      await syncSmsReplies()
      this.msgSuccess('已安排回复同步，稍后刷新收件箱')
    },
    async assign(row) {
      this.candidates = (await listReplyCandidates(row.id)).data
      this.assignment = { id: row.id, formKey: row.assignedFormKey || '' }
      this.assignOpen = true
    },
    async confirmAssignment() {
      await assignSmsReply(this.assignment.id, this.assignment.formKey || null)
      this.assignOpen = false
      await this.load()
    },
    process(row) {
      this.processing = { id: row.id, state: row.state, note: row.note || '' }
      this.processOpen = true
    },
    async confirmProcess() {
      await processSmsReply(this.processing.id, this.processing)
      this.processOpen = false
      await this.load()
    },
    async suppress(phone, active) {
      const result = await this.$prompt(
        active ? '请记录设置账户级拒收的依据' : '请记录恢复联系的依据',
        active ? '设置拒收' : '恢复联系',
        { inputType: 'textarea', inputValidator: (v) => (!!v && v.length <= 500) || '请输入1至500字符' }
      )
      await saveSmsSuppression({ phone, active, note: result.value })
      this.msgSuccess('已保存联系偏好')
      await this.load()
    },
    async addSuppression() {
      const result = await this.$prompt('请输入手机号', '新增本地拒收')
      await this.suppress(result.value, true)
    },
    linkReceipt(row) {
      this.receipt = row
      this.receiptAssignment = { deliveryId: row.matchedDeliveryId || '', note: '' }
      this.receiptOpen = true
    },
    async confirmReceipt() {
      await assignSmsReceipt(this.receipt.id, this.receiptAssignment)
      this.receiptOpen = false
      await this.load()
    },
    async downloadReplies() {
      const r = await exportSmsReplies(this.allAccount ? undefined : this.formKey)
      this.download(r, '短信回复记录')
    }
  }
}
</script>
<style scoped>
.replies-page {
  padding: 24px;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: white;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
}
.toolbar .el-input {
  width: 200px;
}
.toolbar .el-select {
  width: 140px;
}
.hint {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 220px;
  overflow: auto;
}
.el-textarea {
  margin-top: 16px;
}
</style>
