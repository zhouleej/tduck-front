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
export const previewSmsBatch = (data) => request({ url: '/user/form/sms/batches/preview', method: 'post', data, timeout: 120000 })
export const createSmsBatch = (data) => request({ url: '/user/form/sms/batches', method: 'post', data, timeout: 120000 })
export const listSmsBatches = (params) => getRequest('/user/form/sms/batches', params)
export const getSmsBatch = (id) => getRequest(`/user/form/sms/batches/${id}`)
export const listSmsDeliveries = (id, params) => getRequest(`/user/form/sms/batches/${id}/deliveries`, params)
export const actSmsBatch = (id, action) => postRequest(`/user/form/sms/batches/${id}/actions/${action}`)
export const syncSmsBatch = (id) => postRequest(`/user/form/sms/batches/${id}/sync`)
export const getRecipientAnswers = (formKey, recipientId) => getRequest('/user/form/sms/batches/answers', { formKey, recipientId })
export const exportSmsDeliveries = (id, params) => request({ url: `/user/form/sms/batches/${id}/export`, params, responseType: 'blob' })
