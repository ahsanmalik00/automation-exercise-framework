import { faker } from '@faker-js/faker';
import type { PaymentDetails } from '../types';

/**
 * Generates dummy card details only — never real payment data.
 * The site under test accepts any well-formed values.
 */
export function buildPaymentDetails(nameOnCard?: string): PaymentDetails {
  const expiry = faker.date.future({ years: 4 });
  return {
    nameOnCard: nameOnCard ?? faker.person.fullName(),
    cardNumber: faker.finance.creditCardNumber({ issuer: 'visa' }).replace(/\D/g, ''),
    cvc: faker.finance.creditCardCVV(),
    expiryMonth: String(expiry.getMonth() + 1).padStart(2, '0'),
    expiryYear: String(expiry.getFullYear()),
  };
}
