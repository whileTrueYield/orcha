import { faker } from "@faker-js/faker";

const _emails: string[] = [];
export const getUniqEmail = (): string => {
  const email = faker.internet
    .email({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      provider: "example.com",
    })
    .toLowerCase();

  if (_emails.indexOf(email) > -1) {
    return getUniqEmail();
  }

  _emails.push(email);

  return email;
};
