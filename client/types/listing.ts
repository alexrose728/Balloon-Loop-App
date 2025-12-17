export interface Listing {
  id: string;
  title: string;
  description: string;
  eventType: string;
  colors: string[];
  images: string[];
  latitude: number;
  longitude: number;
  address?: string;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
