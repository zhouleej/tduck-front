import { getRequest, postRequest } from '@/api/baseRequest'
export const resolveInvitation = (token) => getRequest(`/public/form/invitation/${encodeURIComponent(token)}`)
export const recordInvitationVisit = (token) => postRequest('/public/form/invitation/visit', { token })
