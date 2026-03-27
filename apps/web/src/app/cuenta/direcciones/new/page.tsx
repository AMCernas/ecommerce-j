import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { ArrowLeft } from 'lucide-react';

export default async function NewAddressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/direcciones/new');
  }

  const handleSuccess = () => {
    // This is handled client-side via the form
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cuenta/direcciones" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-semibold">Nueva Dirección</h2>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <ShippingForm 
          mode="standalone"
          userId={user.id}
          onSuccess={() => {
            // Redirect is handled by the form
          }}
        />
      </div>
    </div>
  );
}
