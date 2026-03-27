import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/account/actions';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/perfil');
  }

  const profile = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-6">Información Personal</h2>
        <ProfileForm 
          userId={user.id} 
          initialData={profile ? {
            email: profile.email,
            name: profile.name || '',
            phone: profile.phone || '',
          } : undefined} 
        />
      </div>
    </div>
  );
}
