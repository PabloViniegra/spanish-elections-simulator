import { describe, expect, it } from "vitest";
import { profilePage } from "./pages";

describe("profilePage", () => {
  it("starts on the first page without a valid number", () => {
    expect(profilePage(undefined, 30)).toEqual({ page: 1, pages: 3, offset: 0 });
    expect(profilePage("abc", 30)).toEqual({ page: 1, pages: 3, offset: 0 });
    expect(profilePage("1.5", 30)).toEqual({ page: 1, pages: 3, offset: 0 });
  });

  it("clamps out-of-range pages to the first or the last", () => {
    expect(profilePage("0", 30)).toEqual({ page: 1, pages: 3, offset: 0 });
    expect(profilePage("9", 30)).toEqual({ page: 3, pages: 3, offset: 24 });
  });

  it("keeps one page when there is nothing saved", () => {
    expect(profilePage("2", 0)).toEqual({ page: 1, pages: 1, offset: 0 });
  });

  it("offsets the requested page", () => {
    expect(profilePage("2", 13)).toEqual({ page: 2, pages: 2, offset: 12 });
  });
});
