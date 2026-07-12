import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { buildUser } from '../data/user.factory';
import { faker } from '@faker-js/faker';
import type { Title } from '../types';

When(
  'the user starts signing up with a fresh name and a unique email address',
  async function (this: CustomWorld) {
    this.activeUser = buildUser();
    await this.pages.header.goToSignupLogin();
    await this.pages.signupLogin.expectLoaded();
    await this.pages.signupLogin.startSignup(this.activeUser.name, this.activeUser.email);
  },
);

When(
  'the user submits the mandatory account information as {string}',
  async function (this: CustomWorld, title: Title) {
    const user = this.activeUser;
    if (!user) throw new Error('Signup was not started — no active user in this scenario.');
    user.title = title;
    // an account may exist on the site from here on, so track it for cleanup
    this.trackAccountForCleanup(user);
    await this.pages.accountInformation.expectLoaded();
    await this.pages.accountInformation.expectPrefilledNameAndEmail(user.name, user.email);
    await this.pages.accountInformation.completeRegistration(user);
  },
);

Then('the account should be created successfully', async function (this: CustomWorld) {
  await this.pages.accountStatus.expectAccountCreated();
  await this.pages.accountStatus.continueToSite();
});

Then('the user should be signed in as the new account holder', async function (this: CustomWorld) {
  const user = this.activeUser;
  if (!user) throw new Error('No active user in this scenario.');
  await this.pages.header.expectLoggedInAs(user.name);
});

When(
  "the user tries to sign up using the existing account's email address",
  async function (this: CustomWorld) {
    const existing = this.activeUser;
    if (!existing) throw new Error('No registered user available in this scenario.');
    await this.pages.signupLogin.startSignup(faker.person.fullName(), existing.email);
  },
);

Then(
  'the signup should be rejected because the email is already registered',
  async function (this: CustomWorld) {
    await this.pages.signupLogin.expectSignupRejectedForExistingEmail();
  },
);
