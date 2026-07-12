import { faker } from '@faker-js/faker';
import type { Title, UserDetails } from '../types';

// Email that stays unique per run, even across parallel workers
// (timestamp + pid + random suffix).
export function uniqueEmail(): string {
  const stamp = Date.now().toString(36);
  const suffix = faker.string.alphanumeric({ length: 6, casing: 'lower' });
  return `qa.auto.${stamp}.${process.pid}.${suffix}@example.com`;
}

// Full set of account details the site will accept, with a unique email.
export function buildUser(overrides: Partial<UserDetails> = {}): UserDetails {
  const title: Title = overrides.title ?? faker.helpers.arrayElement<Title>(['Mr.', 'Mrs.']);
  const firstName = faker.person.firstName(title === 'Mr.' ? 'male' : 'female');
  const lastName = faker.person.lastName();

  return {
    title,
    name: `${firstName} ${lastName}`,
    email: uniqueEmail(),
    password: `Qa!${faker.internet.password({ length: 12 })}`,
    dateOfBirth: {
      day: String(faker.number.int({ min: 1, max: 28 })),
      month: faker.date.month(),
      year: String(faker.number.int({ min: 1970, max: 2000 })),
    },
    firstName,
    lastName,
    company: faker.company.name(),
    address: faker.location.streetAddress(),
    address2: `Apt. ${faker.number.int({ min: 1, max: 999 })}`,
    // has to be an option in the site's country dropdown
    country: 'United States',
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('#####'),
    mobileNumber: faker.string.numeric({ length: 10, allowLeadingZeros: false }),
    newsletter: true,
    specialOffers: true,
    ...overrides,
  };
}

// Credentials that don't belong to any registered account.
export function unregisteredCredentials(): { email: string; password: string } {
  return { email: uniqueEmail(), password: faker.internet.password({ length: 14 }) };
}
