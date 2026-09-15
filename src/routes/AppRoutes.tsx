import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { RoleGuard } from '../auth/RoleGuard';
import { AppLayout } from '../layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { AssetConfigurationPage } from '../pages/admin/AssetConfigurationPage';
import { DivisionOfficialSetupPage } from '../pages/admin/DivisionOfficialSetupPage';
import { WorkflowApprovalMatrixPage } from '../pages/admin/WorkflowApprovalMatrixPage';
import { MakerDashboardPage } from '../pages/maker/MakerDashboardPage';
import { RequisitionDetailPage } from '../pages/maker/RequisitionDetailPage';
import { RequisitionPage } from '../pages/maker/RequisitionPage';
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage';
import { ManagerRequisitionPage } from '../pages/manager/ManagerRequisitionPage';
import { ProcurementOfficerQueuePage } from '../pages/procurementOfficer/ProcurementOfficerQueuePage';
import { ProcurementOfficerReviewPage } from '../pages/procurementOfficer/ProcurementOfficerReviewPage';
import { ProcurementAuthorityDashboardPage } from '../pages/procurementAuthority/ProcurementAuthorityDashboardPage';
import { ProcurementAuthorityReviewPage } from '../pages/procurementAuthority/ProcurementAuthorityReviewPage';
import { ProcurementAuthorityBulkReviewPage } from '../pages/procurementAuthority/ProcurementAuthorityBulkReviewPage';
import { ProcurementAuthorityBulkResultPage } from '../pages/procurementAuthority/ProcurementAuthorityBulkResultPage';
import { ConcernDivisionDashboardPage } from '../pages/concernDivision/ConcernDivisionDashboardPage';
import { ConcernDivisionReviewPage } from '../pages/concernDivision/ConcernDivisionReviewPage';
import { ConcernAuthorityDashboardPage } from '../pages/concernAuthority/ConcernAuthorityDashboardPage';
import { ConcernAuthorityReviewPage } from '../pages/concernAuthority/ConcernAuthorityReviewPage';
import { ConcernAuthorityBulkReviewPage } from '../pages/concernAuthority/ConcernAuthorityBulkReviewPage';
import { ConcernAuthorityBulkResultPage } from '../pages/concernAuthority/ConcernAuthorityBulkResultPage';
import { ProcurementTrackingPage } from '../pages/procurementTracking/ProcurementTrackingPage';
import type { RoleCode } from '../types';

const maker=['MAKER','ADMIN'] as RoleCode[];
export function AppRoutes(){return <Routes><Route path="/login" element={<LoginPage/>}/><Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}>
 <Route path="/dashboard" element={<DashboardPage/>}/><Route path="/unauthorized" element={<UnauthorizedPage/>}/>
 <Route path="/maker/requisitions" element={<RoleGuard roles={maker}><MakerDashboardPage/></RoleGuard>}/><Route path="/maker/requisitions/new" element={<RoleGuard roles={maker}><RequisitionPage/></RoleGuard>}/><Route path="/maker/requisitions/:id" element={<RoleGuard roles={maker}><RequisitionDetailPage/></RoleGuard>}/><Route path="/maker/requisitions/:id/edit" element={<RoleGuard roles={maker}><RequisitionPage/></RoleGuard>}/>
 <Route path="/manager/requisitions" element={<RoleGuard roles={['MANAGER','ADMIN']}><ManagerDashboardPage/></RoleGuard>}/><Route path="/manager/requisitions/:id" element={<RoleGuard roles={['MANAGER','ADMIN']}><ManagerRequisitionPage/></RoleGuard>}/>
 <Route path="/procurement-officer/requisitions" element={<RoleGuard roles={['PROCUREMENT_OFFICER','ADMIN']}><ProcurementOfficerQueuePage/></RoleGuard>}/><Route path="/procurement-officer/requisitions/:id" element={<RoleGuard roles={['PROCUREMENT_OFFICER','ADMIN']}><ProcurementOfficerReviewPage/></RoleGuard>}/>
 <Route path="/procurement-officer/requisitions/pending" element={<RoleGuard roles={['PROCUREMENT_OFFICER','ADMIN']}><ProcurementOfficerQueuePage/></RoleGuard>}/><Route path="/procurement-officer/requisitions/mine" element={<RoleGuard roles={['PROCUREMENT_OFFICER','ADMIN']}><ProcurementOfficerQueuePage/></RoleGuard>}/><Route path="/procurement-officer/requisitions/all" element={<RoleGuard roles={['PROCUREMENT_OFFICER','ADMIN']}><ProcurementOfficerQueuePage/></RoleGuard>}/>
 <Route path="/procurement-authority/requisitions" element={<RoleGuard roles={['PROCUREMENT_AUTHORITY']}><ProcurementAuthorityDashboardPage/></RoleGuard>}/><Route path="/procurement-authority/requisitions/bulk-review" element={<RoleGuard roles={['PROCUREMENT_AUTHORITY']}><ProcurementAuthorityBulkReviewPage/></RoleGuard>}/><Route path="/procurement-authority/requisitions/bulk-result" element={<RoleGuard roles={['PROCUREMENT_AUTHORITY']}><ProcurementAuthorityBulkResultPage/></RoleGuard>}/><Route path="/procurement-authority/requisitions/:id" element={<RoleGuard roles={['PROCUREMENT_AUTHORITY']}><ProcurementAuthorityReviewPage/></RoleGuard>}/>
 <Route path="/concern-division/requisitions" element={<RoleGuard roles={['CONCERN_OFFICIAL']}><ConcernDivisionDashboardPage/></RoleGuard>}/><Route path="/concern-division/requisitions/:id" element={<RoleGuard roles={['CONCERN_OFFICIAL']}><ConcernDivisionReviewPage/></RoleGuard>}/>
 <Route path="/concern-authority/requisitions" element={<RoleGuard roles={['CONCERN_AUTHORITY']}><ConcernAuthorityDashboardPage/></RoleGuard>}/><Route path="/concern-authority/requisitions/bulk-review" element={<RoleGuard roles={['CONCERN_AUTHORITY']}><ConcernAuthorityBulkReviewPage/></RoleGuard>}/><Route path="/concern-authority/requisitions/bulk-result" element={<RoleGuard roles={['CONCERN_AUTHORITY']}><ConcernAuthorityBulkResultPage/></RoleGuard>}/><Route path="/concern-authority/requisitions/:id" element={<RoleGuard roles={['CONCERN_AUTHORITY']}><ConcernAuthorityReviewPage/></RoleGuard>}/>
 <Route path="/procurement/tracking" element={<RoleGuard roles={['PROCUREMENT_TRACKER','PROCUREMENT_OFFICER','PROCUREMENT_AUTHORITY','ADMIN']}><ProcurementTrackingPage/></RoleGuard>}/>
 <Route path="/admin/assets" element={<RoleGuard roles={['ADMIN']}><AssetConfigurationPage/></RoleGuard>}/><Route path="/admin/divisions" element={<RoleGuard roles={['ADMIN']}><DivisionOfficialSetupPage/></RoleGuard>}/><Route path="/admin/workflow" element={<RoleGuard roles={['ADMIN']}><WorkflowApprovalMatrixPage/></RoleGuard>}/>
 <Route path="/reports" element={<RoleGuard roles={['ADMIN','CONCERN_OFFICIAL']}><PlaceholderPage title="Reports" description="Procurement reporting workspace."/></RoleGuard>}/><Route path="/admin/users" element={<RoleGuard roles={['ADMIN']}><PlaceholderPage title="User & Role Management" description="User and role administration."/></RoleGuard>}/><Route path="/admin/settings" element={<RoleGuard roles={['ADMIN']}><PlaceholderPage title="System Settings" description="Procurement system configuration."/></RoleGuard>}/>
 </Route></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes>}
