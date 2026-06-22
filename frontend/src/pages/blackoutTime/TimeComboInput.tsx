import { useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect } from "react";
import { formatToLocalTime } from "utils/time";
import { map, range } from "lodash";
import { ChevronDownIcon } from "@heroicons/react/solid";

export interface ComboTime {
  formatted: string;
  hours: number;
  minutes: number;
}

export const epochToComboTime = (epoch: number): ComboTime => ({
  formatted: formatToLocalTime(
    `${Math.floor(epoch / 3600)}:${Math.floor((epoch % 3600) / 60) * 15}`,
  ),
  hours: Math.floor(epoch / 3600),
  minutes: Math.floor((epoch % 3600) / 60),
});

// display all the times in 15 minute increments
const times: ComboTime[] = map(range(0, 24 * 4), (value) => ({
  formatted: formatToLocalTime(`${Math.floor(value / 4)}:${(value % 4) * 15}`),
  hours: Math.floor(value / 4),
  minutes: (value % 4) * 15,
}));

interface Props {
  value: ComboTime | null;
  onChange: (time: ComboTime | null) => void;
}

export const TimeComboInput: React.FC<Props> = (props) => {
  const [query, setQuery] = useState(props.value ? props.value.formatted : "");
  const [options, setOptions] = useState<ComboTime[]>(times);

  useEffect(() => {
    setOptions(
      times.filter((time) =>
        time.formatted
          .toLowerCase()
          .replaceAll(" ", "")
          .includes(query.replaceAll(" ", "").toLowerCase()),
      ),
    );
  }, [query]);

  return (
    <Combobox
      as="div"
      className="relative"
      value={props.value}
      onChange={props.onChange}
    >
      <ComboboxInput
        className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        displayValue={(item: ComboTime) => {
          return item ? formatToLocalTime(`${item.hours}:${item.minutes}`) : "";
        }}
      />
      <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>
      <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-32 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {options.map((option, index) => (
          <ComboboxOption
            key={index}
            value={option}
            className={({ focus }) =>
              `relative cursor-default select-none whitespace-nowrap py-2 pl-3 pr-9 text-right ${
                focus ? "bg-sky-600 text-white" : "text-gray-900"
              }`
            }
          >
            {option.formatted}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
};
