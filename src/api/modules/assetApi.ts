import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { Asset, AssetCategory, AssetSaveRequest, AssetSpecificationSet, SpecificationSaveRequest, StoredProcedureResult } from '../../types/assets';

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) throw new Error(response.message);
  return response.data;
}

export const assetApi = {
  async search(filters: { assetCategoryId?: number; assetName?: string; assetCode?: string; isActive?: boolean }) {
    const { data } = await axiosClient.get<ApiResponse<Asset[]>>('/assets', { params: filters });
    return unwrap(data);
  },
  async get(id: number) { const { data } = await axiosClient.get<ApiResponse<Asset>>(`/assets/${id}`); return unwrap(data); },
  async categories() { const { data } = await axiosClient.get<ApiResponse<AssetCategory[]>>('/asset-categories', { params: { isActive: true } }); return unwrap(data); },
  async create(request: AssetSaveRequest) { const { data } = await axiosClient.post<ApiResponse<StoredProcedureResult>>('/assets', request); return unwrap(data); },
  async update(id: number, request: AssetSaveRequest) { const { data } = await axiosClient.put<ApiResponse<StoredProcedureResult>>(`/assets/${id}`, request); return unwrap(data); },
  async setActive(id: number, isActive: boolean) { const { data } = await axiosClient.put<ApiResponse<StoredProcedureResult>>(`/assets/${id}/activation`, { isActive }); return unwrap(data); },
  async specifications(assetId: number) { const { data } = await axiosClient.get<ApiResponse<AssetSpecificationSet>>(`/assets/${assetId}/specifications`); return unwrap(data); },
  async createSpecification(assetId: number, request: SpecificationSaveRequest) { const { data } = await axiosClient.post<ApiResponse<StoredProcedureResult>>(`/assets/${assetId}/specifications`, request); return unwrap(data); },
  async updateSpecification(specId: number, request: SpecificationSaveRequest) { const { data } = await axiosClient.put<ApiResponse<StoredProcedureResult>>(`/asset-specifications/${specId}`, request); return unwrap(data); },
  async createOption(specId: number, request: { value: string; displayOrder: number; isActive: boolean }) { const { data } = await axiosClient.post<ApiResponse<StoredProcedureResult>>(`/asset-specifications/${specId}/options`, request); return unwrap(data); },
  async updateOptions(specId: number, requests: { optionId: number; value: string; displayOrder: number; isActive: boolean }[]) { const { data } = await axiosClient.put<ApiResponse<StoredProcedureResult[]>>(`/asset-specifications/${specId}/options`, requests); return unwrap(data); },
};
