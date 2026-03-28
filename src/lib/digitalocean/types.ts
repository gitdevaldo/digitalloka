export interface Droplet {
  id: number;
  name: string;
  status: 'new' | 'active' | 'off' | 'archive';
  memory: number;
  vcpus: number;
  disk: number;
  locked: boolean;
  created_at: string;
  region: {
    name: string;
    slug: string;
  };
  image: {
    id: number;
    name: string;
    distribution: string;
    slug: string | null;
  };
  size: {
    slug: string;
    memory: number;
    vcpus: number;
    disk: number;
    price_monthly: number;
  };
  size_slug: string;
  networks: {
    v4: Array<{
      ip_address: string;
      netmask: string;
      gateway: string;
      type: 'public' | 'private';
    }>;
    v6: Array<{
      ip_address: string;
      netmask: number;
      gateway: string;
      type: 'public' | 'private';
    }>;
  };
  tags: string[];
  vpc_uuid: string | null;
}

export interface DropletAction {
  id: number;
  status: 'in-progress' | 'completed' | 'errored';
  type: string;
  started_at: string;
  completed_at: string | null;
  resource_id: number;
  resource_type: string;
  region_slug: string;
}

export type ActionType = 
  | 'power_on' 
  | 'power_off' 
  | 'shutdown' 
  | 'reboot' 
  | 'power_cycle';

export interface DOApiError {
  id: string;
  message: string;
  request_id?: string;
}
