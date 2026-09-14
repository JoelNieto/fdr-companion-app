import { ContactDetail } from '@/features/contacts/components/ContactDetail';

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-md mx-auto md:max-w-2xl">
      <ContactDetail contactId={id} />
    </div>
  );
}