import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAddress } from '@/lib/account/actions';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { ArrowLeft } from 'lucide-react';

interface EditAddressPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const { id: addressId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/direcciones');
  }

  const address = await getAddress(addressId);

  if (!address) {
    notFound();
  }

  // Verify ownership
  if (address.userId !== user.id) {
    redirect('/cuenta/direcciones');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cuenta/direcciones" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-semibold">Editar Dirección</h2>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <ShippingForm 
          mode="standalone"
          userId={user.id}
          addressId={address.id}
          defaultValues={{
            name: address.name,
            street: address.street,
            exteriorNumber: address.exteriorNumber,
            interiorNumber: address.interiorNumber || undefined,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            phone: address.phone,
          }}
        />
      </div>
    </div>
  );
}
