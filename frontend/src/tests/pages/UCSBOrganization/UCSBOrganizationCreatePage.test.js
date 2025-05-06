import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("OrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization ID")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization where inactive = true", async () => {
    const queryClient = new QueryClient();
    const organization = {
      orgCode: "IEEE",
      orgTranslationShort: "Engineering",
      orgTranslation: "Institute of Electrical and Electronics Engineers",
      inactive: true,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, organization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization ID")).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByLabelText("Organization ID");
    expect(orgCodeInput).toBeInTheDocument();

    const orgTranslationShortInput = screen.getByLabelText(
      "Organization Translation Short",
    );
    expect(orgTranslationShortInput).toBeInTheDocument();

    const orgTranslationInput = screen.getByLabelText(
      "Organization Translation",
    );
    expect(orgTranslationInput).toBeInTheDocument();

    const inactiveInput = screen.getByLabelText("Inactive");
    expect(inactiveInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(orgCodeInput, { target: { value: "IEEE" } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "Engineering" },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "Institute of Electrical and Electronics Engineers" },
    });
    fireEvent.change(inactiveInput, { target: { value: true } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "IEEE",
      orgTranslationShort: "Engineering",
      orgTranslation: "Institute of Electrical and Electronics Engineers",
      inactive: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgCode: IEEE orgTranslationShort: Engineering orgTranslation: Institute of Electrical and Electronics Engineers inactive: true",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization where inactive = false", async () => {
    const queryClient = new QueryClient();
    const organization = {
      orgCode: "IEEE",
      orgTranslationShort: "Engineering",
      orgTranslation: "Institute of Electrical and Electronics Engineers",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, organization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization ID")).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByLabelText("Organization ID");
    expect(orgCodeInput).toBeInTheDocument();

    const orgTranslationShortInput = screen.getByLabelText(
      "Organization Translation Short",
    );
    expect(orgTranslationShortInput).toBeInTheDocument();

    const orgTranslationInput = screen.getByLabelText(
      "Organization Translation",
    );
    expect(orgTranslationInput).toBeInTheDocument();

    const inactiveInput = screen.getByLabelText("Inactive");
    expect(inactiveInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(orgCodeInput, { target: { value: "IEEE" } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "Engineering" },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "Institute of Electrical and Electronics Engineers" },
    });
    fireEvent.change(inactiveInput, { target: { value: false } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "IEEE",
      orgTranslationShort: "Engineering",
      orgTranslation: "Institute of Electrical and Electronics Engineers",
      inactive: false,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgCode: IEEE orgTranslationShort: Engineering orgTranslation: Institute of Electrical and Electronics Engineers inactive: false",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });
});
