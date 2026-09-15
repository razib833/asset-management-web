import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { RequisitionDetail } from '../../types/requisitions';
import type { ConcernAuthorityBulkResult,ConcernAuthorityContext,ConcernAuthorityPending,ConcernAuthorityResult } from '../../types/concernAuthority';
const unwrap=<T>(x:ApiResponse<T>)=>{if(!x.success||x.data===null)throw new Error([x.message,...x.errors].filter(Boolean).join(' '));return x.data};
export const concernAuthorityApi={
 async pending(){const{data}=await axiosClient.get<ApiResponse<ConcernAuthorityPending[]>>('/concern-authority/requisitions/pending');return unwrap(data)},
 async detail(id:number){const{data}=await axiosClient.get<ApiResponse<RequisitionDetail>>(`/concern-authority/requisitions/${id}`);return unwrap(data)},
 async context(id:number){const{data}=await axiosClient.get<ApiResponse<ConcernAuthorityContext>>(`/concern-authority/requisitions/${id}/context`);return unwrap(data)},
 async act(id:number,action:'approve'|'return'|'reject',remarks:string|null){const{data}=await axiosClient.post<ApiResponse<ConcernAuthorityResult>>(`/concern-authority/requisitions/${id}/${action}`,{remarks});return unwrap(data)},
 async bulkApprove(ids:number[],remarks:string|null){const{data}=await axiosClient.post<ApiResponse<ConcernAuthorityBulkResult>>('/concern-authority/requisitions/bulk-approve',{requisitionIds:ids,remarks});return unwrap(data)},
 async bulkReject(ids:number[],remarks:string){const{data}=await axiosClient.post<ApiResponse<ConcernAuthorityBulkResult>>('/concern-authority/requisitions/bulk-reject',{requisitionIds:ids,remarks});return unwrap(data)},
};
