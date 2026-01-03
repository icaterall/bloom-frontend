export interface BookingType {
  code: string;
  name: string;
  default_duration_min: number;
  payment_required: boolean;
  allowed_mode: 'in_centre' | 'online' | 'both';
  default_location?: string;
}

export interface BookingTypePrice {
  price: number;
  currency: string;
}

