import { fireEvent, getByRole, getByText, waitFor } from "@testing-library/dom";

import { createOrbitDetailsElement } from "./orbit-action";

let orbitDetailsElement;

beforeEach(async () => {
  orbitDetailsElement = await createOrbitDetailsElement(
    { API_TOKEN: "token", WORKSPACE: "workspace" },
    "phacks",
    true
  );

  global.fetch = jest
    .fn()
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              attributes: {
                orbit_level: 1,
                reach: 5,
                points: 9,
                contributions_total: 62,
              },
            },
          }),
        ok: true,
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [], included: [] }),
        ok: true,
      })
    );
});

afterEach(() => {
  global.fetch.mockClear();
  delete global.fetch;
});

test("createOrbitDetailsElement should return a button and a menu", () => {
  expect(getByRole(orbitDetailsElement, "button"));
  expect(getByRole(orbitDetailsElement, "menu"));
});

test("createOrbitDetailsElement should trigger 2 fetch requests on mouseover, no fetch requests on repeat mouseover", async () => {
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "See phacks’s profile on Orbit"));
  });
  expect(global.fetch).toHaveBeenCalledTimes(2);
  global.fetch.mockClear();
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "See phacks’s profile on Orbit"));
  });
  expect(global.fetch).toHaveBeenCalledTimes(0);
});

test("createOrbitDetailsElement should display an error message if there was an error fetching data", async () => {
  global.fetch.mockClear();
  const mockJsonPromise = Promise.resolve({});
  const mockFetchPromise = Promise.resolve({
    json: () => mockJsonPromise,
    ok: false,
    status: 500,
  });
  global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(
      getByText(orbitDetailsElement, "There was an error fetching Orbit data")
    );
  });
});

test("createOrbitDetailsElement should display an error message if credentials are missing", async () => {
  orbitDetailsElement = await createOrbitDetailsElement(
    { API_TOKEN: "", WORKSPACE: "workspace" },
    "phacks"
  );
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "API token or workspace is missing"));
  });
});

test("createOrbitDetailsElement should display a loading indicator", async () => {
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "Loading Orbit data…"));
  });
});

test("createOrbitDetailsElement should trigger 2 requests when the user is not a member", async () => {
  global.fetch = jest
    .fn()
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: false,
        status: 404,
      })
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              attributes: {
                contributions_total: 12,
              },
            },
          }),
        ok: true,
      })
    );
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "Contributed 10+ times on GitHub"));
  });
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("createOrbitDetailsElement should display Orbit info if the github user is a member", async () => {
  fireEvent(
    getByRole(orbitDetailsElement, "button"),
    new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true,
    })
  );
  await waitFor(() => {
    expect(getByText(orbitDetailsElement, "Contributed 50+ times on GitHub"));
    expect(getByText(orbitDetailsElement, "See phacks’s profile on Orbit"));
  });
});
