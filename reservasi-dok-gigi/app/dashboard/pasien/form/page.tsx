import { cookies } from 'next/headers';
import PasienFormClient from './pasienFormClient';

export default async function PasienFormPage() {
  // pastikan nama cookie benar (contoh: "access-token")
  const token = (await cookies()).get('access-token')?.value ?? null;

  return <PasienFormClient token={token} />;
}
