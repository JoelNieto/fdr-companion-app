import { ContactList } from '@/features/contacts/components/ContactList';

export default function ContactsPage() {
  return (
    <div className="max-w-md mx-auto md:max-w-2xl">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
      </div>
      <ContactList />
    </div>
  );
}