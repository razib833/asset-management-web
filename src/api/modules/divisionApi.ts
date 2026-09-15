import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { AddAuthorityRequest, AddOfficialRequest, ConcernAuthority, ConcernDivision, ConcernOfficial, DevelopmentEmployee } from '../../types/divisions';
import type { StoredProcedureResult } from '../../types/assets';

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) throw new Error(response.message);
  return response.data;
}

export const divisionApi = {
  async divisions(activeOnly = false) { const { data } = await axiosClient.get<ApiResponse<ConcernDivision[]>>('/concern-divisions', { params: { activeOnly } }); return unwrap(data); },
  async officials(divisionId: number, activeOnly = false) { const { data } = await axiosClient.get<ApiResponse<ConcernOfficial[]>>(`/concern-divisions/${divisionId}/officials`, { params: { activeOnly } }); return unwrap(data); },
  async authorities(divisionId: number, activeOnly = false) { const { data } = await axiosClient.get<ApiResponse<ConcernAuthority[]>>(`/concern-divisions/${divisionId}/authorities`, { params: { activeOnly } }); return unwrap(data); },
  async employees(search = '') { const { data } = await axiosClient.get<ApiResponse<DevelopmentEmployee[]>>('/development-employees', { params: { search } }); return unwrap(data); },
  async addOfficial(divisionId: number, request: AddOfficialRequest) { const { data } = await axiosClient.post<ApiResponse<StoredProcedureResult>>(`/concern-divisions/${divisionId}/officials`, request); return unwrap(data); },
  async removeOfficial(mappingId: number) { const { data } = await axiosClient.delete<ApiResponse<StoredProcedureResult>>(`/concern-divisions/officials/${mappingId}`); return unwrap(data); },
  async addAuthority(divisionId: number, request: AddAuthorityRequest) { const { data } = await axiosClient.post<ApiResponse<StoredProcedureResult>>(`/concern-divisions/${divisionId}/authorities`, request); return unwrap(data); },
  async removeAuthority(mappingId: number) { const { data } = await axiosClient.delete<ApiResponse<StoredProcedureResult>>(`/concern-divisions/authorities/${mappingId}`); return unwrap(data); },
};
