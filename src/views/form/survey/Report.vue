<template>
  <div v-loading="loading">
    <div class="toolbar">
      <el-select v-model="query.batchId" placeholder="全部邀请批次" clearable filterable
        ><el-option
          v-for="batch in batches"
          :key="batch.id"
          :value="batch.id"
          :label="`${batch.id} · ${batch.name}`" /></el-select
      ><el-input v-model="query.groupName" placeholder="分组" clearable /><el-input
        v-model="query.company"
        placeholder="单位"
        clearable
      /><el-button type="primary" @click="load">查询 / 刷新</el-button
      ><el-button v-if="report.mode === 'TRACKED'" @click="downloadIncomplete">导出未完成名单</el-button>
    </div>
    <el-alert
      :title="
        report.mode === 'TRACKED'
          ? '完成人数按邀请对象去重；任意一轮邀请链接完成都会计入对象进度。归因答卷数量按实际使用的批次链接统计。'
          : '匿名模式不关联手机号与答卷，不提供逐人完成率；按分组或单位筛选时，无法推断匿名答卷归属。'
      "
      type="info"
      :closable="false"
    />
    <div class="metric-grid">
      <div v-for="metric in metrics" :key="metric.key" class="metric">
        <span>{{ metric.label }}</span
        ><strong
          >{{ display(report[metric.key])
          }}{{ metric.key === 'completionRate' && report.completionRate !== null ? '%' : '' }}</strong
        >
      </div>
    </div>
    <div class="chart"><t-chart :option="chartOption" style="width: 100%; height: 100%" /></div>
    <p class="hint">
      受邀人数按已进入提交尝试的联系人去重；逐号尝试和网关请求分别统计。送达、访问、提交独立统计，图中不要求逐级递减。
    </p>
    <p class="hint">已知实际拆分条数：{{ display(report.actualSegments) }}。{{ report.segmentsNote }}</p>
    <el-alert
      v-if="report.anonymousGroupAttributionUnavailable"
      title="当前匿名筛选无法归因访问及答卷，相关指标显示为“—”。"
      type="warning"
      :closable="false"
    />
  </div>
</template>
<script>
import TChart from '@/components/TChart'
import { getSurveyReport, exportIncomplete } from '@/api/project/survey'
import { listSmsBatches } from '@/api/project/sms'
export default {
  name: 'SurveyReport',
  components: { TChart },
  data() {
    return {
      loading: false,
      report: {},
      batches: [],
      query: { formKey: this.$route.query.key, batchId: null, groupName: '', company: '' }
    }
  },
  computed: {
    metrics() {
      const values = [
        { key: 'validRecipients', label: '有效调研对象' },
        { key: 'plannedRecipients', label: '计划邀请对象' },
        { key: 'invitedRecipients', label: '实际受邀对象' },
        { key: 'invitationAttempts', label: '逐号发送尝试' },
        { key: 'networkRequests', label: '网关请求次数' },
        { key: 'accepted', label: '已受理人次' },
        { key: 'sendSuccess', label: '发送成功人次' },
        { key: 'deliverySuccess', label: '送达成功人次' },
        { key: 'failed', label: '明确失败人次' },
        { key: 'unknown', label: '结果未确认人次' },
        { key: 'visitCount', label: '邀请链接访问次数' },
        { key: 'attributedAnswers', label: '通过批次链接提交的答卷' }
      ]
      if (this.report.mode === 'TRACKED')
        values.push(
          { key: 'visitedRecipients', label: '访问对象人数' },
          { key: 'completedRecipients', label: '完成对象人数' },
          { key: 'incompleteRecipients', label: '未完成对象人数' },
          { key: 'completionRate', label: '受邀对象完成率' }
        )
      return values
    },
    chartOption() {
      const stages = this.metrics.filter((v) =>
        ['accepted', 'sendSuccess', 'deliverySuccess', 'completedRecipients'].includes(v.key)
      )
      return {
        tooltip: { trigger: 'axis' },
        grid: { left: 65, right: 25, bottom: 50, top: 25 },
        xAxis: { type: 'category', data: stages.map((v) => v.label) },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            type: 'bar',
            data: stages.map((v) => this.report[v.key] || 0),
            itemStyle: { color: '#409eff' },
            barMaxWidth: 50
          }
        ]
      }
    }
  },
  created() {
    this.load()
    listSmsBatches({ formKey: this.query.formKey, page: 1, size: 100 }).then((r) => {
      this.batches = r.data.records
    })
  },
  methods: {
    display(value) {
      return value === null || value === undefined ? '—' : value
    },
    async load() {
      this.loading = true
      try {
        this.report = (await getSurveyReport(this.query)).data
      } finally {
        this.loading = false
      }
    },
    async downloadIncomplete() {
      const r = await exportIncomplete(this.query)
      this.download(r, '调研未完成对象')
    }
  }
}
</script>
<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.toolbar .el-select {
  width: 260px;
}
.toolbar .el-input {
  width: 150px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.metric {
  border: 1px solid #e5e7eb;
  padding: 18px;
  border-radius: 10px;
}
.metric span {
  color: #6b7280;
  font-size: 13px;
}
.metric strong {
  display: block;
  font-size: 26px;
  color: #1f2937;
  margin-top: 12px;
}
.chart {
  height: 320px;
}
.hint {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}
</style>
