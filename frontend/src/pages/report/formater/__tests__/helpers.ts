import { addDays, addHours } from "date-fns";
import { map, range } from "lodash";
import { ReportDateGranularity, ReportGroupBy } from "types/graphql";
import {
  DatumGranularity,
  datumToDate,
  autoFormatDatum,
  guessTimeGranularity,
  bucketDates,
} from "../helpers";

describe("datumToDate", () => {
  it("display month name plus year", () => {
    const formatDateFn = datumToDate(DatumGranularity.month);

    const october_6_2022 = new Date("2022-10-06T23:32:36.364Z").getTime();

    expect(formatDateFn(october_6_2022.toString())).toBe("Oct 2022");
  });

  it("display short date", () => {
    const formatDateFn = datumToDate(DatumGranularity.day);

    const october_6_2022 = new Date("2022-10-06T23:32:36.364Z").getTime();

    expect(formatDateFn(october_6_2022.toString())).toBe("Thu Oct 6");
  });

  it("display ISO date", () => {
    const formatDateFn = datumToDate(DatumGranularity.iso);

    const october_6_2022 = new Date("2022-10-06T23:32:36.364Z").getTime();

    expect(formatDateFn(october_6_2022.toString())).toBe("2022-10-06");
  });

  it("display unknown when cannot be converted", () => {
    const formatDateFn = datumToDate(DatumGranularity.iso);

    expect(formatDateFn(null)).toBe("Unknown");
    expect(formatDateFn()).toBe("Unknown");
    expect(formatDateFn("Something")).toBe("Unknown");
  });
});

describe("autoFormatDatum", () => {
  it("auto format a date when field is an epoch", () => {
    const october_6_2022 = new Date("2022-10-06T23:32:36.364Z").getTime();

    const formatDateFn = autoFormatDatum(
      ReportGroupBy.ClosedAt,
      DatumGranularity.iso
    );

    expect(formatDateFn(october_6_2022.toString())).toBe("2022-10-06");
  });

  it("does not autoformat when field is not an epoch", () => {
    const october_6_2022 = new Date("2022-10-06T23:32:36.364Z").getTime();

    // here while we provide a timestamp we also declare it as a TAG
    const formatDateFn = autoFormatDatum(
      ReportGroupBy.Tag,
      DatumGranularity.iso
    );

    expect(formatDateFn(october_6_2022.toString())).toBe(
      october_6_2022.toString()
    );
  });
});

describe("getStep", () => {
  it("switches to day when less than 3 weeks", () => {
    const dates = map(range(21), (index) => addDays(new Date(), index));
    expect(guessTimeGranularity(dates)).toBe("DAY");
  });

  it("switches to day when less than 3 weeks over multiple same day records", () => {
    const dates = map(range(63), (index) => addHours(new Date(), index * 8));
    expect(guessTimeGranularity(dates)).toBe("DAY");
  });

  it("switches to weeks when 3 weeks or longer", () => {
    const dates = map(range(22), (index) => addDays(new Date(), index));
    expect(guessTimeGranularity(dates)).toBe("WEEK");
  });

  it("switches to month when 14 weeks or longer", () => {
    const dates = map(range(15 * 7), (index) => addDays(new Date(), index));
    expect(guessTimeGranularity(dates)).toBe("MONTH");
  });
});

describe("bucketDates", () => {
  it("Groups values by day", () => {
    const datum = [
      {
        main: new Date("2022-03-13T02:00:00").getTime().toString(),
        value: 1,
      },
      {
        main: new Date("2022-03-13T01:00:00").getTime().toString(),
        value: 1,
      },
    ];

    expect(
      bucketDates(datum, ReportGroupBy.ClosedAt, ReportDateGranularity.Day)
    ).toEqual([
      {
        main: new Date("2022-03-13T00:00:00").getTime().toString(),
        value: 2,
      },
    ]);
  });

  it("Groups values by day and secondary", () => {
    const datum = [
      {
        secondary: "foo",
        main: new Date("2022-03-13T02:00:00").getTime().toString(),
        value: 1,
      },
      {
        secondary: "bar",
        main: new Date("2022-03-14T01:00:00").getTime().toString(),
        value: 1,
      },
    ];

    expect(
      bucketDates(datum, ReportGroupBy.ClosedAt, ReportDateGranularity.Day)
    ).toEqual([
      {
        secondary: "foo",
        main: new Date("2022-03-13T00:00:00").getTime().toString(),
        value: 1,
      },
      {
        secondary: "bar",
        main: new Date("2022-03-13T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        secondary: "foo",
        main: new Date("2022-03-14T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        secondary: "bar",
        main: new Date("2022-03-14T00:00:00").getTime().toString(),
        value: 1,
      },
    ]);
  });

  it("Add missing days", () => {
    const datum = [
      {
        main: new Date("2022-03-13T02:00:00").getTime().toString(),
        value: 1,
      },
      {
        main: new Date("2022-03-15T01:00:00").getTime().toString(),
        value: 1,
      },
    ];

    expect(
      bucketDates(datum, ReportGroupBy.ClosedAt, ReportDateGranularity.Day)
    ).toEqual([
      {
        main: new Date("2022-03-13T00:00:00").getTime().toString(),
        value: 1,
      },
      {
        main: new Date("2022-03-14T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        main: new Date("2022-03-15T00:00:00").getTime().toString(),
        value: 1,
      },
    ]);
  });

  it("Add missing months", () => {
    const datum = [
      {
        main: new Date("2022-03-13T02:00:00").getTime().toString(),
        value: 1,
      },
      {
        main: new Date("2022-03-17T02:00:00").getTime().toString(),
        value: 1,
      },
      {
        main: new Date("2022-07-15T01:00:00").getTime().toString(),
        value: 1,
      },
    ];

    expect(
      bucketDates(datum, ReportGroupBy.ClosedAt, ReportDateGranularity.Month)
    ).toEqual([
      {
        main: new Date("2022-03-01T00:00:00").getTime().toString(),
        value: 2,
      },
      {
        main: new Date("2022-04-01T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        main: new Date("2022-05-01T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        main: new Date("2022-06-01T00:00:00").getTime().toString(),
        value: 0,
      },
      {
        main: new Date("2022-07-01T00:00:00").getTime().toString(),
        value: 1,
      },
    ]);
  });
});
