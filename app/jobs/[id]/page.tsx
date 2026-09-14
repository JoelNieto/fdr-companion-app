import { JobDetail } from '@/features/jobs/components/JobDetail';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto">
      <JobDetail jobId={id} />
    </div>
  );
}