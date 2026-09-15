import type { StoredProcedureResult } from './assets';
export interface ProcurementOfficerRequisition{id:number;number:string;requestedDate:string;totalEstimatedAmount:number;status:string;itemCount:number;assignedToEmployeeId:string|null;isOwnedByCurrentUser:boolean;assetNames:string;orgUnitName:string;requestedByEmployeeId:string;requestedByName:string;requisitionTypes:string}
export type ProcurementOfficerResult=StoredProcedureResult;
export interface Comment{id:number;requisitionId:number;requisitionItemId:number|null;commentType:string;commentText:string;createdByEmployeeId:string;createdDate:string}
export interface ApprovalHistory{id:number;requisitionId:number;requisitionItemId:number|null;actionType:string;actionByEmployeeId:string;actionRole:string;fromStage:string|null;toStage:string|null;actionDate:string;remarks:string|null;batchReferenceId:string|null}
export interface WorkflowHistory{id:number;requisitionId:number;workflowRuleId:number|null;fromStage:string|null;toStage:string;actionType:string;actionByEmployeeId:string;actionDate:string;remarks:string|null;batchReferenceId:string|null}
