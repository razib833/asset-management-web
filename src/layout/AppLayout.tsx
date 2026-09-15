import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
export function AppLayout() { return <div className="app-shell"><Sidebar /><div className="app-main"><TopHeader /><main className="content"><Outlet /></main></div></div>; }
