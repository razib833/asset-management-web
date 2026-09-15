import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { ManagerActionResult, ManagerPendingRequisition, ManagerRequisitionDetail } from '../../types/manager';
const unwrap=<T>(response:ApiResponse<T>)=>{if(!response.success||response.data===null)throw new Error(response.message);return response.data};
export const managerApi={
  async pending(){const{data}=await axiosClient.get<ApiResponse<ManagerPendingRequisition[]>>('/manager/requisitions/pending');return unwrap(data)},
  async detail(id:number){const{data}=await axiosClient.get<ApiResponse<ManagerRequisitionDetail>>(`/manager/requisitions/${id}`);return unwrap(data)},
  async approve(id:number,remarks:string|null){const{data}=await axiosClient.post<ApiResponse<ManagerActionResult>>(`/manager/requisitions/${id}/approve`,{remarks});return unwrap(data)},
  async returnToMaker(id:number,remarks:string){const{data}=await axiosClient.post<ApiResponse<ManagerActionResult>>(`/manager/requisitions/${id}/return`,{remarks});return unwrap(data)},
  async reject(id:number,remarks:string){const{data}=await axiosClient.post<ApiResponse<ManagerActionResult>>(`/manager/requisitions/${id}/reject`,{remarks});return unwrap(data)}
};
