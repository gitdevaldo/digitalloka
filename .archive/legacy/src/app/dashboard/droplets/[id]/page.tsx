import { DropletDetail } from '@/components/droplets/droplet-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DropletPage({ params }: PageProps) {
  const { id } = await params;
  
  return <DropletDetail dropletId={id} />;
}
