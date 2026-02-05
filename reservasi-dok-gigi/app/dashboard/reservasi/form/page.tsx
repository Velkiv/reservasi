import { cookies } from 'next/headers';
import ReservasiFormClient from './reservasiFormCreate';

export default async function ReservasiFormPage() {
  // pastikan nama cookie benar (contoh: "access-token")
  const token = (await cookies()).get('access-token')?.value ?? null;

  return <ReservasiFormClient token={token} />;
}
