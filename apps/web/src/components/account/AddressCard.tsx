'use client';

import { Address } from '@/lib/account/types';
import { Button } from '@ecoomerce-jardineria/ui';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { deleteAddress } from '@/lib/account/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AddressCardProps {
  address: Address;
  onEdit: (id: string) => void;
  onDeleted: () => void;
}

export function AddressCard({ address, onEdit, onDeleted }: AddressCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // We need the userId for delete - in a real app, this would come from context
    // For now, we'll use a workaround
    const result = await deleteAddress(address.id, address.userId);
    setIsDeleting(false);
    
    if ('success' in result) {
      onDeleted();
    } else {
      alert(result.error);
    }
  };

  const fullAddress = [
    address.street,
    address.exteriorNumber,
    address.interiorNumber && `, ${address.interiorNumber}`,
    address.neighborhood,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-xl border p-6 relative">
      {/* Default Badge */}
      {address.isDefault && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircle className="h-4 w-4" />
          Predeterminada
        </div>
      )}

      {/* Name */}
      <h3 className="font-semibold text-lg mb-2">{address.name}</h3>

      {/* Address */}
      <p className="text-gray-600 mb-4">{fullAddress}</p>

      {/* Phone */}
      <p className="text-sm text-gray-500 mb-6">Tel: {address.phone}</p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(address.id)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        {showConfirm ? (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Confirmar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}
