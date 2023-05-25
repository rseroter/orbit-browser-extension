import "./widget";
import { mockChrome } from "../test-helpers";

describe("obe-widget", () => {
  let element;

  beforeEach(() => {
    element = document.createElement("obe-widget");
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it("sets property default values", () => {
    expect(element.isOpen).toBe(false);
    expect(element.isLoading).toBe(false);
    expect(element.hasAuthError).toBe(false);
    expect(element.hasError).toBe(false);
    expect(element.showAllTags).toBe(false);
    expect(element.isAMember).toBe(false);
    expect(element.member).toEqual({});
    expect(element.workspace).toEqual({});
  });

  it("sets default state", () => {
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.innerHTML).not.toMatch("Loading Orbit data");
    expect(dropdown.innerHTML).not.toMatch("Authentication error");
    expect(dropdown.innerHTML).not.toMatch(
      "There was an error fetching Orbit data"
    );
  });

  it("responds to click event", () => {
    element.isOpen = true;
    document.dispatchEvent(new Event("click"));
    expect(element.isOpen).toBe(false);
  });

  it("toggles isOpen property when _toggle is called", () => {
    element._toggle();
    expect(element.isOpen).toBe(true);
    element._toggle();
    expect(element.isOpen).toBe(false);
  });

  it("renders dropdown when isOpen is true", () => {
    element.isOpen = true;
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.style.visibility).toBe("visible");
  });

  it("does not render dropdown when isOpen is false", () => {
    element.isOpen = false;
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.style.visibility).toBe("hidden");
  });

  it("renders loading state when isLoading is true", () => {
    element.isLoading = true;
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.innerHTML).toMatch("Loading Orbit data");
  });

  it("renders auth error state when hasAuthError is true", () => {
    element.hasAuthError = true;
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.innerHTML).toMatch("Authentication error");
  });

  it("renders generic error state when hasError is true", () => {
    element.hasError = true;
    element.update();
    const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
    expect(dropdown.innerHTML).toMatch(
      "There was an error fetching Orbit data"
    );
  });

  it("sets showAllTags to true when _showAllTags called", () => {
    expect(element.showAllTags).toBe(false);
    element._showAllTags();
    expect(element.showAllTags).toBe(true);
  });

  describe("#_loadOrbitData", () => {
    it("exits the flow without updating if already loading", () => {
      element.isLoading = true;
      element.update();
      element._loadOrbitData();
      const dropdown = element.shadowRoot.querySelector(".obe-dropdown");
      expect(dropdown.innerHTML).toMatch("Loading Orbit data");
    });

    it("shows auth error if response is 401", async () => {
      const originalChrome = mockChrome(
        {},
        {
          success: true,
          status: 401,
        }
      );

      expect(element.hasAuthError).toBe(false);

      await element._loadOrbitData();
      await element.updateComplete;

      expect(element.hasAuthError).toBe(true);

      global.chrome = originalChrome;
    });

    it("shows not a member template if user is not found", async () => {
      element.isAMember = true;
      element.update();

      const originalChrome = mockChrome(
        {},
        {
          success: true,
          status: 404,
        }
      );

      expect(element.isAMember).toBe(true);

      await element._loadOrbitData();
      await element.updateComplete;

      expect(element.isAMember).toBe(false);

      global.chrome = originalChrome;
    });

    it("shows generic error if request fails", async () => {
      const originalChrome = mockChrome(
        {},
        {
          success: false,
          status: 500,
        }
      );

      expect(element.hasError).toBe(false);

      await element._loadOrbitData();
      await element.updateComplete;

      expect(element.hasError).toBe(true);

      global.chrome = originalChrome;
    });

    it("shows generic error if data is empty", async () => {
      element.isAMember = true;
      element.update();

      const originalChrome = mockChrome(
        {},
        {
          success: true,
          status: 200,
          response: {},
        }
      );

      expect(element.isAMember).toBe(true);
      expect(element.hasError).toBe(false);

      await element._loadOrbitData();
      await element.updateComplete;

      expect(element.isAMember).toBe(false);
      expect(element.hasError).toBe(true);
      expect(element.isLoading).toBe(false);

      global.chrome = originalChrome;
    });

    it("fetches & displays member if member is correctly retrieved", async () => {
      const originalChrome = mockChrome(
        {},
        {
          success: true,
          status: 200,
          response: {
            data: {
              attributes: {
                name: "Delete",
                title: "CEO",
                slug: "delete",
                teammate: false,
                orbit_level: 100,
                last_activity_occurred_at: 1234,
                tags: ["123"],
              },
              relationships: {
                identities: { data: [] },
                organizations: { data: [] },
              },
            },
            included: [{ id: 123, type: "twitter_identity" }],
          },
        }
      );

      expect(element.hasAuthError).toBe(false);
      expect(element.hasError).toBe(false);
      expect(element.isAMember).toBe(false);

      expect(element.member).toEqual({});

      await element._loadOrbitData();
      await element.updateComplete;

      expect(element.hasAuthError).toBe(false);
      expect(element.hasError).toBe(false);
      expect(element.isAMember).toBe(true);

      expect(element.member).toEqual({
        identities: [],
        jobTitle: "CEO",
        lastActivityOccurredAt: 1234,
        name: "Delete",
        orbitLevel: 100,
        organization: null,
        slug: "delete",
        tags: ["123"],
        teammate: false,
      });

      global.chrome = originalChrome;
    });
  });
});