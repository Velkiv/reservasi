import { cookies } from 'next/headers';
import PasienFormClient from './pasienFormClient';
import { redirect } from 'next/navigation';

export default async function PasienFormPage() {
  // pastikan nama cookie benar (contoh: "access-token")
  const token = (await cookies()).get('access-token')?.value ?? null;

  if(!token) {
    redirect("/login")
  }

  return <PasienFormClient token={token} />;
}
