import { axiosClient } from '../axiosClient';
import type { ApiResponse } from '../../types';
import type { StoredProcedureResult } from '../../types/assets';
import type { ProcurementOfficerMapping, SaveWorkflowRuleRequest, WorkflowEvaluation, WorkflowRule } from '../../types/workflow';
function unwrap<T>(response:ApiResponse<T>):T{if(!response.success||response.data===null)throw new Error(response.message);return response.data}
export const workflowApi={
 async rules(activeOnly=false){const{data}=await axiosClient.get<ApiResponse<WorkflowRule[]>>('/workflow-rules',{params:{activeOnly}});return unwrap(data)},
 async createRule(request:SaveWorkflowRuleRequest){const{data}=await axiosClient.post<ApiResponse<StoredProcedureResult>>('/workflow-rules',request);return unwrap(data)},
 async updateRule(id:number,request:SaveWorkflowRuleRequest){const{data}=await axiosClient.put<ApiResponse<StoredProcedureResult>>(`/workflow-rules/${id}`,request);return unwrap(data)},
 async setRuleActive(id:number,isActive:boolean){const{data}=await axiosClient.put<ApiResponse<StoredProcedureResult>>(`/workflow-rules/${id}/activation`,{isActive});return unwrap(data)},
 async evaluate(assetId:number,requisitionType:string,amount:number){const{data}=await axiosClient.post<ApiResponse<WorkflowEvaluation>>('/workflow-rules/evaluate',{assetId,requisitionType,amount});return unwrap(data)},
 async officers(assetId:number,activeOnly=false){const{data}=await axiosClient.get<ApiResponse<ProcurementOfficerMapping[]>>(`/assets/${assetId}/procurement-officers`,{params:{activeOnly}});return unwrap(data)},
 async addOfficer(assetId:number,request:{employeeId:string;isPrimary:boolean;effectiveFrom:string;effectiveTo:string|null}){const{data}=await axiosClient.post<ApiResponse<StoredProcedureResult>>(`/assets/${assetId}/procurement-officers`,request);return unwrap(data)},
 async removeOfficer(assetId:number,mappingId:number){const{data}=await axiosClient.delete<ApiResponse<StoredProcedureResult>>(`/assets/${assetId}/procurement-officers/${mappingId}`);return unwrap(data)},
};
