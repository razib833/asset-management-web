import type{StoredProcedureResult}from'./assets';
export interface ConcernPending{id:number;number:string;requestedDate:string;totalEstimatedAmount:number;concernDivisionId:number;concernDivisionName:string;requestedByName:string;itemCount:number}
export interface ConcernContext{workflowRuleId:number;ruleCode:string;ruleName:string;currentStage:string;matrixDestination:'READY_FOR_PROCUREMENT'|'PROCUREMENT_AUTHORITY';concernDivisionId:number;concernDivisionName:string}
export type ConcernResult=StoredProcedureResult;
