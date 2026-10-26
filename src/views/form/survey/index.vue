<template>
  <div class="survey-page" v-loading="loading">
    <el-card shadow="never">
      <div slot="header"><strong>调研设置</strong></div>
      <el-radio-group v-model="settings.mode" :disabled="settings.modeLocked">
        <el-radio label="ANONYMOUS">匿名调研</el-radio>
        <el-radio label="TRACKED">跟踪邀请进度</el-radio>
      </el-radio-group>
      <p class="hint">{{ settings.mode === 'ANONYMOUS' ? '仅统计邀请批次的访问与答卷，不关联收件人，无法精准排除已填写者。' : '按邀请链接记录访问及完成，并可查看关联答卷。填写页面会明确提示，链接转发不证明填写人身份。' }}</p>
      <p v-if="settings.modeLocked" class="hint">已创建正式邀请，填写方式已锁定。如需切换，请复制问卷。</p>
      <el-button v-else size="small" type="primary" :loading="saving" @click="saveSettings">保存设置</el-button>
    </el-card>
    <el-card shadow="never" class="list-card">
      <div slot="header"><strong>调研对象</strong><span class="hint"> 联系人为单位，手机号去重</span></div>
      <div class="toolbar">
        <el-input v-model="query.keyword" placeholder="手机号、姓名或单位" clearable @keyup.enter.native="search" />
        <el-input v-model="query.groupName" placeholder="分组" clearable />
        <el-select v-model="query.disabled" placeholder="全部状态" clearable><el-option label="启用" :value="false" /><el-option label="停用" :value="true" /></el-select>
        <el-button @click="search">查询</el-button>
        <el-button type="primary" @click="edit()">添加联系人</el-button>
        <el-button @click="importOpen = true">导入 / 粘贴</el-button>
        <el-button @click="downloadList(false)">导出名单</el-button>
      </div>
      <el-table :data="rows" stripe>
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="company" label="单位" min-width="160" show-overflow-tooltip />
        <el-table-column prop="groupName" label="分组" min-width="100" />
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="80"><template slot-scope="s"><el-tag :type="s.row.disabled ? 'info' : 'success'">{{ s.row.disabled ? '停用' : '启用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150"><template slot-scope="s"><el-button type="text" @click="edit(s.row)">编辑</el-button><el-button type="text" @click="toggle(s.row)">{{ s.row.disabled ? '启用' : '停用' }}</el-button></template></el-table-column>
      </el-table>
      <pagination :total="total" :page.sync="query.page" :limit.sync="query.size" @pagination="load" />
    </el-card>
    <el-dialog title="联系人" :visible.sync="editOpen" append-to-body width="520px">
      <el-form label-width="80px" @submit.native.prevent>
        <el-form-item label="手机号" required><el-input v-model="draft.phone" :disabled="!!draft.id" maxlength="20" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="draft.name" maxlength="100" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="draft.company" maxlength="200" /></el-form-item>
        <el-form-item label="分组"><el-input v-model="draft.groupName" maxlength="100" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="draft.remark" type="textarea" maxlength="1000" /></el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="editOpen = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></div>
    </el-dialog>
    <el-dialog title="导入调研对象" :visible.sync="importOpen" append-to-body width="850px" :close-on-click-modal="false">
      <el-button size="small" @click="downloadList(true)">下载Excel模板</el-button>
      <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls" :on-change="fileChanged"><el-button size="small">选择Excel（最多2MB / 1万行）</el-button></el-upload>
      <el-input v-model="paste" type="textarea" :rows="5" placeholder="每行一条，按 手机号、姓名、单位、分组、备注 排列，可用制表符或逗号分隔；也可仅粘贴手机号。" />
      <el-button size="small" :loading="previewing" @click="previewPaste">预检粘贴内容</el-button>
      <template v-if="preview">
        <p>共 {{ preview.total }} 条：新增 {{ preview.counts.NEW || 0 }}，已存在 {{ preview.counts.EXISTING || 0 }}，重复 {{ preview.counts.DUPLICATE || 0 }}，无效 {{ preview.counts.INVALID || 0 }}。</p>
        <el-checkbox v-model="updateExisting">更新已存在联系人提供的资料（不修改历史和状态）</el-checkbox>
        <el-table :data="preview.rows.slice(0, 100)" max-height="280" size="mini"><el-table-column prop="phone" label="手机号" /><el-table-column prop="name" label="姓名" /><el-table-column prop="company" label="单位" /><el-table-column label="预检"><template slot-scope="s">{{ statusNames[s.row.status] }}</template></el-table-column></el-table>
        <p class="hint">仅预览前100条；重复、无效记录将跳过，确认后才保存。</p>
      </template>
      <div slot="footer"><el-button @click="importOpen = false">取消</el-button><el-button type="primary" :loading="saving" :disabled="!preview" @click="confirmImport">确认导入</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { getSurveySettings, saveSurveySettings, listRecipients, saveRecipient, previewRecipients, confirmRecipients, previewRecipientFile, exportRecipients } from '@/api/project/survey'
export default {
  name: 'SurveyRecipients', components: { Pagination },
  data() { return { formKey: this.$route.query.key, settings: { mode: 'ANONYMOUS', modeLocked: false }, query: { page: 1, size: 20, keyword: '', groupName: '', disabled: null }, rows: [], total: 0, loading: false, saving: false, editOpen: false, draft: {}, importOpen: false, paste: '', preview: null, previewing: false, updateExisting: false, statusNames: { NEW: '可新增', EXISTING: '已存在', DUPLICATE: '文件内重复', INVALID: '无效 / 属性过长' } } },
  created() { this.load(); getSurveySettings(this.formKey).then(r => { this.settings = r.data }) },
  methods: {
    async load() { this.loading = true; try { const r = await listRecipients({ ...this.query, formKey: this.formKey }); this.rows = r.data.records; this.total = r.data.total } finally { this.loading = false } },
    search() { this.query.page = 1; this.load() },
    edit(row) { this.draft = row ? { ...row } : { formKey: this.formKey, phone: '', name: '', company: '', groupName: '', remark: '' }; this.editOpen = true },
    async save() { this.saving = true; try { await saveRecipient(this.draft); this.editOpen = false; this.msgSuccess('已保存'); await this.load() } finally { this.saving = false } },
    async toggle(row) { await saveRecipient({ ...row, disabled: !row.disabled }); await this.load() },
    async saveSettings() { this.saving = true; try { this.settings = (await saveSurveySettings({ ...this.settings, formKey: this.formKey })).data; this.msgSuccess('设置已保存') } finally { this.saving = false } },
    async fileChanged(file) { if (file.size > 2 * 1024 * 1024) return this.msgError('文件不能超过2MB'); this.previewing = true; this.preview = null; try { this.preview = (await previewRecipientFile(this.formKey, file.raw)).data } finally { this.previewing = false } },
    async previewPaste() { const rows = this.paste.split(/\r?\n/).filter(v => v.trim()).map(line => { const values = line.split(/[\t,，]/); const row = {}; ['phone', 'name', 'company', 'groupName', 'remark'].forEach((key, i) => { if (values[i] !== undefined) row[key] = values[i].trim() }); return row }); this.previewing = true; this.preview = null; try { this.preview = (await previewRecipients({ formKey: this.formKey, rows })).data } finally { this.previewing = false } },
    async confirmImport() { this.saving = true; try { const r = await confirmRecipients({ formKey: this.formKey, rows: this.preview.rows, updateExisting: this.updateExisting }); this.msgSuccess(`新增${r.data.added}条，更新${r.data.updated}条，跳过${r.data.skipped}条`); this.importOpen = false; this.preview = null; this.paste = ''; await this.load() } finally { this.saving = false } },
    async downloadList(template) { const r = await exportRecipients(this.formKey, template); this.download(r, template ? '调研对象导入模板' : '调研对象名单') }
  }
}
</script>

<style scoped>
.survey-page { padding: 24px; height: 100%; overflow-y: auto; box-sizing: border-box; }
.list-card { margin-top: 20px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.toolbar .el-input { width: 180px; }.toolbar .el-select { width: 120px; }
.hint { color: #6b7280; font-size: 13px; line-height: 1.7; }
.el-upload { margin: 12px 0; }
</style>
