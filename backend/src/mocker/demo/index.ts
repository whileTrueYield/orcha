import "reflect-metadata";
import { generateDemo } from "./generateDemo";
import { exit } from "process";

async function run() {
  const { roles, password } = await generateDemo();

  const table = [];

  for (const role of roles) {
    table.push({
      name: role.name,
      title: role.title,
      type: role.type,
      email: role.user.email,
    });
  }

  console.log(`Roles (password is "${password}")`);
  console.table(table);

  console.log(table.toString());

  exit(0);
}

run();
