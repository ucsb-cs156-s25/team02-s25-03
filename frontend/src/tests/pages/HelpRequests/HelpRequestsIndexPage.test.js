import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HelpRequestsIndexPage from "main/pages/HelpRequests/HelpRequestsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { helpRequestFixtures } from "fixtures/helpRequestsFixtures";

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

describe("HelpRequestsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "HelpRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/helprequests/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create HelpRequest/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create HelpRequest/);
    expect(button).toHaveAttribute("href", "/helprequests/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three HelpRequests correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    const createButton = screen.queryByText("Create HelpRequest");
    expect(createButton).not.toBeInTheDocument();

    const reqEmail = screen.getByText("sburicha@ucsb.edu");
    expect(reqEmail).toBeInTheDocument();

    const teamId = screen.getByText("s22-5pm-3");
    expect(teamId).toBeInTheDocument();

    const tableOrBreakoutRoom = screen.getByText("5");
    expect(tableOrBreakoutRoom).toBeInTheDocument();

    // const requestTime = screen.getByText("2022-04-20T17:35:00Z");
    // expect(requestTime).toBeInTheDocument();

    const explanation = screen.getByText("DokkuIssue");
    expect(explanation).toBeInTheDocument();

    // const solved = screen.getByText("DokkuIssue");
    // expect(solved).toBe(true); // or false

    // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
    expect(
      screen.queryByTestId("HelpRequestTable-cell-row-0-col-Delete-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("HelpRequestTable-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/helprequests/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/helprequests/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    axiosMock
      .onDelete("/api/helprequests")
      .reply(200, "HelpRequest with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest with id 1 was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/helprequests");
    expect(axiosMock.history.delete[0].url).toBe("/api/helprequests");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
