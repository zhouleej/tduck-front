<template>
  <div class="statistics-tabs">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="邀请与回收" name="survey" lazy>
        <survey-report />
      </el-tab-pane>
      <el-tab-pane label="统计视图" name="chart">
        <chart />
      </el-tab-pane>
      <el-tab-pane label="数据分析" name="analysis">
        <analysis />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import chart from './chart'
import analysis from './analysis'
import SurveyReport from '../survey/Report.vue'

export default {
  name: 'ProjectStatistics',
  components: {
    SurveyReport,
    chart,
    analysis
  },
  data() {
    return {
      activeName: 'chart'
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style scoped>
.statistics-tabs {
  overflow-y: auto;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  background-color: transparent;
}

::v-deep .el-tabs--border-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  background-color: #ffffff;
}

::v-deep .el-tabs--border-card > .el-tabs__header {
  background-color: #f9fafb;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px 16px 0 0;
  margin: 0;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  border: none;
  color: #6b7280;
  transition: all 0.3s ease;
  height: 48px;
  line-height: 48px;
  font-size: 15px;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  color: #3370ff;
  font-weight: 600;
  background-color: #ffffff;
  border-right-color: transparent;
  border-left-color: transparent;
}

::v-deep .el-tabs__content {
  padding: 24px !important;
}
</style>
