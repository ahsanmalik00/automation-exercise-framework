export interface UserCredentials {
  email: string;
  password: string;
}

export interface DateOfBirth {
  day: string;
  month: string;
  year: string;
}

export type Title = 'Mr.' | 'Mrs.';

export interface UserDetails extends UserCredentials {
  title: Title;
  name: string;
  dateOfBirth: DateOfBirth;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
  newsletter: boolean;
  specialOffers: boolean;
}

export interface PaymentDetails {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface CartLine {
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}
