import { DropletList } from '@/components/droplets/droplet-list';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Your Droplets</h1>
        <p className="text-muted-foreground font-medium mt-1">Manage your server instances</p>
      </div>
      <DropletList />
    </div>
  );
}
