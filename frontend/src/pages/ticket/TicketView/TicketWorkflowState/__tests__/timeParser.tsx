import { timeFormater, timeParser } from "../timeParser";

describe("Time parser", () => {
  describe("parses simple input", () => {
    it("by minutes", () => {
      expect(timeParser("11m")).toBe(11 * 60);
    });
    it("by hour", () => {
      expect(timeParser("21h")).toBe(21 * 3600);
    });
  });

  describe("parses spaced input", () => {
    it("by minutes", () => {
      expect(timeParser(" 11   m ")).toBe(11 * 60);
    });
    it("by hour", () => {
      expect(timeParser("   21 h ")).toBe(21 * 3600);
    });
  });

  describe("trim useless info", () => {
    it("by minutes", () => {
      expect(timeParser(" 11   months ")).toBe(11 * 60);
    });
    it("by hour", () => {
      expect(timeParser("   21 hours ")).toBe(21 * 3600);
    });
  });

  it("defaults to hours", () => {
    expect(timeParser("11")).toBe(11 * 3600);
  });

  it("captures floating point values", () => {
    expect(timeParser("11.5")).toBe(11.5 * 3600);
  });

  it("captures short floating point values", () => {
    expect(timeParser(".5")).toBe(0.5 * 3600);
  });

  describe("removes commas", () => {
    it("by minutes", () => {
      expect(timeParser(" 11,123 minutes ")).toBe(11123 * 60);
    });
  });
});

describe("time formater", () => {
  it("formats whole minutes", () => {
    expect(timeFormater(60 * 8)).toBe("8m");
  });
  it("formats whole hour", () => {
    expect(timeFormater(3600 * 6)).toBe("6h");
  });
  it("formats whole days", () => {
    expect(timeFormater(3600 * 8 * 3)).toBe("24h");
  });
  it("formats whole weeks", () => {
    expect(timeFormater(3600 * 8 * 10)).toBe("80h");
  });

  it("formats partial minutes", () => {
    expect(timeFormater(60 * 8.5)).toBe("8.5m");
  });
  it("formats partial hour", () => {
    expect(timeFormater(3600 * 6.3)).toBe("6.3h");
  });
  it("formats partial weeks", () => {
    expect(timeFormater(3600 * 8 * 12.5)).toBe("100h");
  });

  it("defaults to 0h", () => {
    expect(timeFormater()).toBe("0h");
  });

  it("rounds floating values to 2 decimals", () => {
    expect(timeFormater(4.333333333 * 3600)).toBe("4.33h");
    expect(timeFormater(3.666666666 * 3600)).toBe("3.67h");
  });
});
