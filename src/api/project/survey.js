import request from '@/api'
import { getRequest, postRequest } from '@/api/baseRequest'

const root = '/user/form/survey'
export const getSurveySettings = (formKey) => getRequest(`${root}/settings`, { formKey })
export const saveSurveySettings = (data) => postRequest(`${root}/settings`, data)
export const listRecipients = (params) => getRequest(`${root}/recipients`, params)
export const saveRecipient = (data) => postRequest(`${root}/recipients`, data)
export const previewRecipients = (data) => postRequest(`${root}/recipients/preview`, data)
export const confirmRecipients = (data) => request({ url: `${root}/recipients/import/confirm`, method: 'post', data, timeout: 120000 })
export const previewRecipientFile = (formKey, file) => {
  const data = new FormData()
  data.append('file', file)
  return request({ url: `${root}/recipients/import/preview`, method: 'post', params: { formKey }, data, headers: { 'Content-Type': 'multipart/form-data' } })
}
export const exportRecipients = (formKey, template = false) => request({ url: `${root}/recipients/export`, params: { formKey, template }, responseType: 'blob' })
