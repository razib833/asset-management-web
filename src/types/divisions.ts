export interface ConcernDivision { id: number; orgUnitId: number; setupCode: string; isActive: boolean; orgUnitCode: string; orgUnitName: string; orgUnitType: string }
export interface ConcernOfficial { mappingId: number; concernDivisionId: number; employeeId: string; fullName: string | null; email: string | null; designation: string | null; isActive: boolean; effectiveFrom: string; effectiveTo: string | null }
export interface ConcernAuthority extends ConcernOfficial { authorityLevel: number }
export interface DevelopmentEmployee { employeeId: string; fullName: string; email: string; designation: string; orgUnitId: number; orgUnitCode: string }
export interface AddOfficialRequest { employeeId: string; effectiveFrom: string; effectiveTo: string | null }
export interface AddAuthorityRequest extends AddOfficialRequest { authorityLevel: number }
