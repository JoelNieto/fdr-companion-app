import { JobDetail } from '@/features/jobs/components/JobDetail';
import { dataStore } from '@/lib/storage/data-store';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const jobs = dataStore.getJobs();
  return jobs.map((job) => ({
    id: job.id,
  }));
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto">
      <JobDetail jobId={id} />
    </div>
  );
}