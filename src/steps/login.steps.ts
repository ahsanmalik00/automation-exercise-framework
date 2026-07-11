import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { unregisteredCredentials } from '../data/user.factory';

When('the user logs in with valid credentials', async function (this: CustomWorld) {
  const user = this.activeUser;
  if (!user) throw new Error('No registered user available in this scenario.');
  await this.pages.signupLogin.login(user.email, user.password);
});

Then('the user should be logged in successfully', async function (this: CustomWorld) {
  const user = this.activeUser;
  if (!user) throw new Error('No registered user available in this scenario.');
  if (this.verifyLoginName) {
    await this.pages.header.expectLoggedInAs(user.name);
  } else {
    // Env-provided credentials without VALID_USER_NAME: verify the session only.
    await this.pages.header.expectLoggedInAs('');
  }
});

When(
  'the user attempts to log in with credentials that are not registered',
  async function (this: CustomWorld) {
    const credentials = unregisteredCredentials();
    await this.pages.signupLogin.login(credentials.email, credentials.password);
  },
);

Then('the user should not be logged in', async function (this: CustomWorld) {
  await this.pages.signupLogin.expectStillOnLoginPage();
  await this.pages.header.expectLoggedOut();
});

Then(
  'an incorrect credentials error message should be displayed',
  async function (this: CustomWorld) {
    await this.pages.signupLogin.expectInvalidLoginError();
  },
);
