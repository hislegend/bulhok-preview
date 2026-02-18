import ClientPage from './ClientPage';
import { DUMMY_CONTENTS } from '@/lib/dummyData';

export async function generateStaticParams() {
  return DUMMY_CONTENTS.map((c) => ({ id: c.id }));
}

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  return <ClientPage id={params.id} />;
}
