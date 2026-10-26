<template>
  <el-dialog title="通过邀请链接提交的答卷" :visible.sync="open" append-to-body width="760px">
    <div v-loading="loading">
      <el-button v-for="answer in answers" :key="answer.id" size="small" @click="view(answer.id)"
        >答卷 {{ answer.id }} · {{ answer.create_time || answer.createTime }}</el-button
      ><view-data v-if="model" :fields="fields" :page-form-model="model" /><el-empty
        v-else-if="!answers.length"
        description="暂无有效关联答卷"
      />
    </div>
  </el-dialog>
</template>
<script>
import ViewData from '@/views/form/data/ViewData.vue'
import { getRecipientAnswers } from '@/api/project/sms'
import { getFormDataDetailsRequest } from '@/api/project/data'
export default {
  name: 'RecipientAnswers',
  components: { ViewData },
  props: { formKey: { type: String, required: true } },
  data() {
    return { open: false, loading: false, answers: [], fields: [], model: null }
  },
  methods: {
    async show(recipientId) {
      this.open = true
      this.model = null
      this.answers = []
      this.fields = []
      this.loading = true
      try {
        this.answers = (await getRecipientAnswers(this.formKey, recipientId)).data
        if (this.answers.length === 1) await this.view(this.answers[0].id)
      } finally {
        this.loading = false
      }
    },
    async view(id) {
      const r = await getFormDataDetailsRequest(id)
      this.fields = r.data.formFields
      this.model = r.data.formData
    }
  }
}
</script>
