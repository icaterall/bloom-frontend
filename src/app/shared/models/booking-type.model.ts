export interface BookingType {
  code: string;
  name: string;
  default_duration_min: number;
  allowed_mode: 'in_centre' | 'online' | 'both';
  payment_required: boolean;
}

export interface BookingTypePrice {
  price: number;
  currency: string;
}

