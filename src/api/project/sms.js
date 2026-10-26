import { getRequest, postRequest } from '../baseRequest'
import request from '@/api'

// 仅返回启用状态与默认邀请模板，不包含云信开户凭据
export const getFormSmsConfigRequest = (formKey) => getRequest('/user/form/sms/config', { formKey })
export const sendFormSmsInviteRequest = (data) => postRequest('/user/form/sms/invite', data)

export const getSmsCapabilities = () => getRequest('/user/form/sms/capabilities')
export const listSmsTemplates = (params) => getRequest('/user/form/sms/templates', params)
export const saveSmsTemplate = (data) => postRequest('/user/form/sms/templates', data)
export const applySmsTemplate = (id) => postRequest(`/user/form/sms/templates/${id}/apply`)
export const refreshSmsTemplateAudit = (id) => postRequest(`/user/form/sms/templates/${id}/audit`)
export const previewSmsBatch = (data) =>
  request({ url: '/user/form/sms/batches/preview', method: 'post', data, timeout: 120000 })
export const createSmsBatch = (data) =>
  request({ url: '/user/form/sms/batches', method: 'post', data, timeout: 120000 })
export const listSmsBatches = (params) => getRequest('/user/form/sms/batches', params)
export const getSmsBatch = (id) => getRequest(`/user/form/sms/batches/${id}`)
export const listSmsDeliveries = (id, params) => getRequest(`/user/form/sms/batches/${id}/deliveries`, params)
export const actSmsBatch = (id, action) => postRequest(`/user/form/sms/batches/${id}/actions/${action}`)
export const syncSmsBatch = (id) => postRequest(`/user/form/sms/batches/${id}/sync`)
export const getRecipientAnswers = (formKey, recipientId) =>
  getRequest('/user/form/sms/batches/answers', { formKey, recipientId })
export const exportSmsDeliveries = (id, params) =>
  request({ url: `/user/form/sms/batches/${id}/export`, params, responseType: 'blob' })
export const previewSmsReminder = (id, data) => postRequest(`/user/form/sms/batches/${id}/reminders/preview`, data)
export const createSmsReminder = (id, data) =>
  request({ url: `/user/form/sms/batches/${id}/reminders`, method: 'post', data, timeout: 120000 })
export const resolveSmsSubmission = (id, data) => postRequest(`/user/form/sms/batches/deliveries/${id}/resolve`, data)
export const listSmsReplies = (params) => getRequest('/user/form/sms/replies', params)
export const syncSmsReplies = () => postRequest('/mange/sms/replies/sync')
export const listReplyCandidates = (id) => getRequest(`/mange/sms/replies/${id}/candidates`)
export const assignSmsReply = (id, formKey) => postRequest(`/mange/sms/replies/${id}/assign`, { formKey })
export const processSmsReply = (id, data) => postRequest(`/user/form/sms/replies/${id}/process`, data)
export const listSmsSuppressions = (params) => getRequest('/mange/sms/suppressions', params)
export const saveSmsSuppression = (data) => postRequest('/mange/sms/suppressions', data)
export const listUnmatchedReceipts = (params) => getRequest('/mange/sms/receipts', params)
export const assignSmsReceipt = (id, data) => postRequest(`/mange/sms/receipts/${id}/assign`, data)
export const listSmsSyncHealth = () => getRequest('/mange/sms/sync-health')
export const exportSmsReplies = (formKey) =>
  request({ url: '/user/form/sms/replies/export', params: { formKey }, responseType: 'blob' })
