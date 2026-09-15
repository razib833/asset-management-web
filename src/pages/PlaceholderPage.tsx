import { Construction } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Breadcrumb } from '../layout/Breadcrumb';
import { ContentContainer } from '../layout/ContentContainer';
import { PageHeader } from '../layout/PageHeader';
export function PlaceholderPage({ title, description }: { title: string; description: string }) { return <ContentContainer><Breadcrumb items={['Home', title]} /><PageHeader title={title} description={description} /><Card><div className="state"><Construction size={34} /><strong>Foundation ready</strong><span>This protected module will be implemented in its dedicated frontend step.</span></div></Card></ContentContainer>; }
