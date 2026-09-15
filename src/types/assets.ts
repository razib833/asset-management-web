export type SpecificationType = 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'MULTI_SELECT' | 'YES_NO';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AssetCategory { id: number; code: string; name: string; description: string | null; isActive: boolean }
export interface Asset { id: number; assetCategoryId: number; categoryName: string | null; code: string; name: string; description: string | null; unitOfMeasurement: string; defaultWarranty: number | null; usefulLife: number | null; capitalizationThreshold: number | null; criticality: Criticality; isInventoryItem: boolean; isDepreciable: boolean; isActive: boolean }
export interface AssetSaveRequest { assetCategoryId: number; assetCode: string; assetName: string; description: string | null; unitOfMeasurement: string; defaultWarranty: number | null; usefulLife: number | null; capitalizationThreshold: number | null; criticality: Criticality; isInventoryItem: boolean; isDepreciable: boolean; isActive?: boolean }
export interface AssetSpecificationOption { optionId: number; value: string; displayOrder: number; isActive: boolean }
export interface AssetSpecification { specId: number; name: string; type: SpecificationType; isMandatory: boolean; displayOrder: number; isActive: boolean; options: AssetSpecificationOption[] }
export interface AssetSpecificationSet { assetId: number; specifications: AssetSpecification[] }
export interface SpecificationSaveRequest { name: string; type: SpecificationType; isMandatory: boolean; displayOrder: number; isActive: boolean }
export interface StoredProcedureResult { resultCode: string; resultMessage: string; entityId: number | null; referenceNo: string | null }
