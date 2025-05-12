import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestsCreatePage";
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

describe("HelpRequestsCreatePage tests", () => {
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
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /helprequest", async () => {
    const queryClient = new QueryClient();

    const helprequest = {
      id: 1,
      requesterEmail: "sburicha@ucsb.edu",
      teamId: "s22-5pm-3\t",
      tableOrBreakoutRoom: "5",
      requestTime: "2022-04-20T17:35Z",
      explanation: "DokkuIssue",
      solved: false,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helprequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const reqEmailInput = screen.getByLabelText("Requester Email");
    expect(reqEmailInput).toBeInTheDocument();

    const teamIdInput = screen.getByLabelText("Team Id");
    expect(teamIdInput).toBeInTheDocument();

    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "Table or Breakout Room",
    );
    expect(tableOrBreakoutRoomInput).toBeInTheDocument();

    const requestTimeInput = screen.getByLabelText("Request Time");
    expect(requestTimeInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const solvedInput = screen.getByLabelText("Solved");
    expect(solvedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(reqEmailInput, { target: { value: "sburicha@ucsb.edu" } });
    fireEvent.change(teamIdInput, { target: { value: "s22-5pm-3\t" } });

    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: "5" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2022-04-20T17:35" },
    });
    fireEvent.change(explanationInput, { target: { value: "DokkuIssue" } });
    fireEvent.change(solvedInput, { target: { value: "sburicha@ucsb.edu" } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "sburicha@ucsb.edu",
      teamId: "s22-5pm-3\t",
      tableOrBreakoutRoom: "5",
      requestTime: "2022-04-20T17:35Z",
      explanation: "DokkuIssue",
      solved: false,
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New helprequest Created - id: 1 requesterEmail: sburicha@ucsb.edu teamId: s22-5pm-3\t tableOrBreakoutRoom: 5 requestTime: 2022-04-20T17:35Z explanation: DokkuIssue solved: false",
    );

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });
  });
});
