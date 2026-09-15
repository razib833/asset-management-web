import { Link } from 'react-router-dom';
export function UnauthorizedPage() { return <main className="center-page"><h1>Access restricted</h1><p>Your authenticated role does not allow access to this area.</p><Link className="button" to="/dashboard">Return to dashboard</Link></main>; }
