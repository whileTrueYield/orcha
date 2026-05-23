import { DefaultRawDatum } from "@nivo/pie";
import { filter, groupBy, sortBy } from "lodash";
import { QueryAggregate } from "types/graphql";
import { autoFormatDatum, FormaterOptions } from "./helpers";

interface PieDatum extends DefaultRawDatum {}

export function formatForPieChart(
  values: QueryAggregate[],
  options: FormaterOptions
): PieDatum[] {
  const { main, granularity, noUnknowns } = options;
  const results: PieDatum[] = [];
  const mainFormaterFn = autoFormatDatum(main, granularity);

  // remove unknowns if requested
  if (noUnknowns) {
    values = filter(values, "main");
  }

  values = sortBy(values, "main");
  const indexedValues = groupBy(values, "main");

  for (const key in indexedValues) {
    const result: PieDatum = {
      id: mainFormaterFn(key),
      value: 0,
    };

    for (const row of indexedValues[key]) {
      result.value += row.value;
    }

    results.push(result);
  }

  // sort DESC by value
  return sortBy(results, (row) => -1 * row.value);
}
