
export interface Settings {
  id: string;
  name: string;
  iacDescription: string;
  iacCode: string | null;
  createdAt: string;
  updatedAt: string;
  timeZone: string;
  timeZoneDescription?: string;
}
