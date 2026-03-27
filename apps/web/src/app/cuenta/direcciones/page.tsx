import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAddresses } from '@/lib/account/actions';
import { Address } from '@/lib/account/types';
import { AddressCard } from '@/components/account/AddressCard';
import { Button } from '@ecoomerce-jardineria/ui';
import { Plus } from 'lucide-react';

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/direcciones');
  }

  const addresses = await getAddresses(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis Direcciones</h2>
        <Link href="/cuenta/direcciones/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Dirección
          </Button>
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
          <Link href="/cuenta/direcciones/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar tu primera dirección
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCardWrapper 
              key={address.id} 
              address={address}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Client wrapper for refresh capability
function AddressCardWrapper({ 
  address, 
}: { 
  address: Address;
}) {
  // This is a workaround - in a real app, we'd use router.refresh() after delete
  // For now, we'll just let the Link handle navigation
  return (
    <AddressCard 
      address={address} 
      onEdit={(id) => window.location.href = `/cuenta/direcciones/${id}/edit`}
      onDeleted={() => window.location.reload()}
    />
  );
}
