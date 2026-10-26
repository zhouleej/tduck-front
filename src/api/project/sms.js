import { getRequest, postRequest } from '../baseRequest'

// 仅返回启用状态与默认邀请模板，不包含云信开户凭据
export const getFormSmsConfigRequest = (formKey) => getRequest('/user/form/sms/config', { formKey })
export const sendFormSmsInviteRequest = (data) => postRequest('/user/form/sms/invite', data)

export const getSmsCapabilities = () => getRequest('/user/form/sms/capabilities')
export const listSmsTemplates = (params) => getRequest('/user/form/sms/templates', params)
export const saveSmsTemplate = (data) => postRequest('/user/form/sms/templates', data)
export const applySmsTemplate = (id) => postRequest(`/user/form/sms/templates/${id}/apply`)
export const refreshSmsTemplateAudit = (id) => postRequest(`/user/form/sms/templates/${id}/audit`)
