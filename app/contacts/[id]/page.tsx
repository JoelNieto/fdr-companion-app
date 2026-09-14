import { ContactDetail } from '@/features/contacts/components/ContactDetail';
import { dataStore } from '@/lib/storage/data-store';

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const contacts = dataStore.getContacts();
  return contacts.map((contact) => ({
    id: contact.id,
  }));
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  return (
    <div className="max-w-md mx-auto md:max-w-2xl">
      <ContactDetail contactId={id} />
    </div>
  );
}