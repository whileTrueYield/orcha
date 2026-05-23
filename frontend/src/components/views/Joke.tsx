import React from "react";
import { sample } from "lodash";

const jokes: string[] = [
  "Why did the invisible man turn down the job offer? \n He couldn't see himself doing it. ",
  "Don't trust atoms. \nThey make up everything! ",
  "The fattest knight at King Arthur's round table was Sir Cumference. \n He acquired his size from too much pi.",
  "Justice is a dish best served cold, if it were served warm it would be justwater.",
  "I ordered a chicken and an egg from Amazon. \n I'll let you know",
  "What do you call someone with no body and no nose? \n Nobody knows.",
  "A slice of apple pie is $2.50 in Jamaica and $3.00 in the Bahamas. \n These are the pie rates of the Caribbean.",
  "I only know 25 letters of the alphabet. I don't know y.",
  "How does the moon cut his hair? \nEclipse it",
  "What did Baby Corn say to Mama Corn?\nWhere's Pop Corn?",
  "I don't trust stairs. They're always up to something.",
  "That car looks nice but the muffler seems exhausted.",
  "Why did the scarecrow win an award? \nBecause he was outstanding in his field.",
  "What does a baby computer call his father? \nData.",
  "After an unsuccessful harvest, why did the farmer decide to try a career in music?\nBecause he had a ton of sick beets.",
  "Why is it so cheap to throw a party at a haunted house?\nBecause the ghosts bring all the boos.",
  "I don't get why Marvel doesn't use the Hulk to advertise more. He's basically one big Banner.",
  "Which days are the strongest?\nSaturday and Sunday. The rest are weekdays.",
  'My wife asked me the other day where I got so much candy.\nI said, "I always have a few Twix up my sleeve."',
  "How do cows stay up to date?\nThey read the Moo-spaper.",
  "In fact, if you sneer at any other method of measuring liquids, you may be held in contempt of quart.",
  "The difference between a numerator and a denominator is a short line. Only a fraction of people will understand this",
  "What's Forrest Gump's password?\n1forrest1.",
  "Wanna hear a joke about paper?\nNever mind. It's tearable.",
  "How does cereal pay its bills?\nWith Chex.",
  "Have you heard about the restaurant on the moon?\nGreat food, no atmosphere.",
  "What's a lawyer's favorite drink?\nSubpoena colada.",
  "What did Yoda say when he saw himself in 4K?\nHDMI.",
  "I used to hate facial hair, but then it grew on me.",
  "What's blue and not very heavy?\nLight blue.",
  "I don't get why bakers aren't wealthier. They make so much dough.",
  "What's an astronaut's favorite part of the computer?\nThe Space Bar.",
  "Are monsters good at math?\nNot unless you Count Dracula.",
  "Someone complimented my parking today! They left a sweet note on my windshield that said “parking fine.”",
  "Why was the math book sad?\nIt had a lot of problems.",
  "How do you make time fly?\nThrow a clock out the window!",
  "How do you make seven even?\nSubtract the “S.”",
  "What do you call an adventurous number?\nA roamin' numeral.",
  "How are a dollar and the moon similar?\nThey both have four quarters!",
  "Did you hear the one about the statistician?\nProbably.",
];

// Only change joke every 1 minute
let cache: string[] = [];
const getOneJoke = (): string[] => {
  if (cache.length === 0) {
    const joke = sample(jokes) as string;
    cache = joke.split("\n");
    setTimeout(() => (cache = []), 24 * 3600 * 1000);
  }

  return cache;
};

export const Joke: React.FC = () => {
  return (
    <span className="italic">
      {getOneJoke().map((sentence, index) => (
        <span className="block" key={index}>
          {sentence}
        </span>
      ))}
    </span>
  );
};
