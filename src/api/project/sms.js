import { getRequest, postRequest } from '../baseRequest'

// 仅返回启用状态与默认邀请模板，不包含云信开户凭据
export const getFormSmsConfigRequest = (formKey) => getRequest('/user/form/sms/config', { formKey })
export const sendFormSmsInviteRequest = (data) => postRequest('/user/form/sms/invite', data)
