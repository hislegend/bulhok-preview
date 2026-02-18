import ClientPage from './ClientPage';

export async function generateStaticParams() {
  return [];
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ClientPage params={params} />;
}
