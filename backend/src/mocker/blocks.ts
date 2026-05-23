import { faker } from "@faker-js/faker";
import { random, range } from "lodash";

interface DataBlock {
  type: "header" | "paragraph" | "code";
  data: {};
}

export function generateBlocks(): DataBlock[] {
  const blocks: DataBlock[] = [
    {
      type: "header",
      data: {
        level: 1,
        text: faker.hacker.adjective() + " " + faker.hacker.noun(),
      },
    },
    {
      type: "paragraph",
      data: {
        text: faker.lorem.paragraph(),
      },
    },
  ];

  for (let i of range(random(40))) {
    const headerOdds = Math.random();
    blocks.push({
      type: "paragraph",
      data: {
        text: faker.lorem.paragraph(),
      },
    });

    if (headerOdds > 0.8) {
      blocks.push({
        type: "header",
        data: {
          level: 2,
          text: faker.hacker.adjective() + " " + faker.hacker.noun(),
        },
      });
    } else if (headerOdds > 0.6) {
      blocks.push({
        type: "header",
        data: {
          level: 3,
          text: faker.hacker.adjective() + " " + faker.hacker.noun(),
        },
      });
    }

    const codeOdds = Math.random();
    if (codeOdds > 0.95) {
      blocks.push({
        type: "code",
        data: {
          code: "if (foo > bar) {\n  console.log(foo);\n}",
        },
      });
    } else if (codeOdds > 0.9) {
      blocks.push({
        type: "code",
        data: {
          code: "_.chunk(['a', 'b', 'c', 'd'], 2);\n// => [['a', 'b'], ['c', 'd']]\n\n_.chunk(['a', 'b', 'c', 'd'], 3);\n// => [['a', 'b', 'c'], ['d']]",
        },
      });
    }
  }

  return blocks;
}
