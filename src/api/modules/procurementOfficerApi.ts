import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { RequisitionDetail } from '../../types/requisitions';
import type { ApprovalHistory,Comment,ProcurementOfficerRequisition,ProcurementOfficerResult,WorkflowHistory } from '../../types/procurementOfficer';
const unwrap=<T>(x:ApiResponse<T>)=>{if(!x.success||x.data===null)throw new Error(x.message);return x.data};
export const procurementOfficerApi={
 async queue(){const{data}=await axiosClient.get<ApiResponse<ProcurementOfficerRequisition[]>>('/procurement-officer/requisitions');return unwrap(data)},
 async detail(id:number){const{data}=await axiosClient.get<ApiResponse<RequisitionDetail>>(`/procurement-officer/requisitions/${id}`);return unwrap(data)},
 async take(id:number,remarks:string|null=null){const{data}=await axiosClient.post<ApiResponse<ProcurementOfficerResult>>(`/procurement-officer/requisitions/${id}/take`,{remarks});return unwrap(data)},
 async approve(id:number,remarks:string|null){const{data}=await axiosClient.post<ApiResponse<ProcurementOfficerResult>>(`/procurement-officer/requisitions/${id}/approve`,{remarks});return unwrap(data)},
 async returnForClarification(id:number,remarks:string){const{data}=await axiosClient.post<ApiResponse<ProcurementOfficerResult>>(`/procurement-officer/requisitions/${id}/return`,{remarks});return unwrap(data)},
 async reject(id:number,remarks:string){const{data}=await axiosClient.post<ApiResponse<ProcurementOfficerResult>>(`/procurement-officer/requisitions/${id}/reject`,{remarks});return unwrap(data)},
 async comment(id:number,requisitionItemId:number,text:string){const{data}=await axiosClient.post<ApiResponse<ProcurementOfficerResult>>(`/procurement-officer/requisitions/${id}/comments`,{requisitionItemId,commentText:text});return unwrap(data)},
 async comments(id:number){const{data}=await axiosClient.get<ApiResponse<Comment[]>>('/comments',{params:{requisitionId:id}});return unwrap(data)},
 async approvalHistory(id:number){try{const{data}=await axiosClient.get<ApiResponse<ApprovalHistory[]>>(`/requisitions/${id}/approval-history`);return unwrap(data)}catch{return[]}},
 async workflowHistory(id:number){try{const{data}=await axiosClient.get<ApiResponse<WorkflowHistory[]>>(`/requisitions/${id}/workflow-history`);return unwrap(data)}catch{return[]}}
};
