import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { ProcurementStatus, ProcurementTrackingDetail, ProcurementTrackingRow, StatusBatchResult, StatusUpdateRequest, WorkOrderBatchResult, WorkOrderRequest } from '../../types/procurementTracking';

const unwrap=<T>(response:ApiResponse<T>)=>{if(!response.success||response.data===null)throw new Error([response.message,...response.errors].filter(Boolean).join(' '));return response.data};

export const procurementTrackingApi={
 async search(filters:{requisitionNo?:string;orgUnitId?:number;assetId?:number;statusCode?:string}){const{data}=await axiosClient.get<ApiResponse<ProcurementTrackingRow[]>>('/procurement-tracking/search',{params:filters});return unwrap(data)},
 async statuses(){const{data}=await axiosClient.get<ApiResponse<ProcurementStatus[]>>('/procurement-tracking/statuses');return unwrap(data)},
 async detail(id:number){const{data}=await axiosClient.get<ApiResponse<ProcurementTrackingDetail>>(`/procurement-tracking/${id}`);return unwrap(data)},
 async updateStatus(request:StatusUpdateRequest){const{data}=await axiosClient.post<ApiResponse<StatusBatchResult>>('/procurement-tracking/bulk-update-status',request);return unwrap(data)},
 async assignWorkOrder(request:WorkOrderRequest){const{data}=await axiosClient.post<ApiResponse<WorkOrderBatchResult>>('/work-orders/bulk-assign',request);return unwrap(data)}
};
