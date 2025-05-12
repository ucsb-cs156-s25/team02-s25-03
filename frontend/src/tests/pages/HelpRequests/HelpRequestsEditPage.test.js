import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";
//import { mockToast } from "react-toastify";

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
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit HelpRequest");
      expect(screen.queryByTestId("HelpRequest-requesterEmail")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: "17",
        requesterEmail: "sburicha@ucsb.edu",
        teamId: "s22-5pm-3\t",
        tableOrBreakoutRoom: "5",
        requestTime: "2022-04-20T17:35:01.000Z",
        explanation: "DokkuIssue",
        solved: false,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: "17",
        requesterEmail: "syuricha@ucsb.edu",
        teamId: "s22-6pm-3\t",
        tableOrBreakoutRoom: "7",
        requestTime: "2023-04-20T17:35:02.000Z",
        explanation: "DokkuIssue",
        solved: false,
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const reqEmailField = screen.getByLabelText("Requester Email");
      const teamIdField = screen.getByLabelText("Team Id");
      const tableOrBreakoutRoomField = screen.getByLabelText("Table or Breakout Room");
      const requestTimeField = screen.getByLabelText("Request Time");
      const explanationField = screen.getByLabelText("Explanation");
      const solvedField = screen.getByLabelText("Solved");
      
      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");


      expect(reqEmailField).toBeInTheDocument();
      expect(reqEmailField).toHaveValue("sburicha@ucsb.edu");


      expect(teamIdField).toBeInTheDocument();
      expect(teamIdField).toHaveValue("s22-5pm-3\t");

      expect(tableOrBreakoutRoomField).toBeInTheDocument();
      expect(tableOrBreakoutRoomField).toHaveValue("5");

      expect(requestTimeField).toBeInTheDocument();
      expect(requestTimeField).toHaveValue("2022-04-20T17:35:01.000");

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("DokkuIssue");

      expect(solvedField).toBeInTheDocument();
      expect(solvedField).not.toBeChecked(); 

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(reqEmailField, {
        target: { value: "syuricha@ucsb.edu" },
      });
      fireEvent.change(teamIdField, {
        target: { value: "s22-6pm-3\t" },
      });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "7" },
      });
      fireEvent.change(requestTimeField, {
        target: { value: "2023-04-20T17:35:02" },
      });
      fireEvent.change(explanationField, {
        target: { value: "DokkuIssue" },
      });
      fireEvent.change(solvedField, {
        target: { value: "false" },
      });

      

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());

      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest Updated - id: 17 requesterEmail: syuricha@ucsb.edu teamId: s22-6pm-3	 tableOrBreakoutRoom: 7 requestTime: 2023-04-20T17:35:02.000Z explanation: DokkuIssue solved: false"
    );

      

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: "17" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
            requesterEmail: "syuricha@ucsb.edu",
            teamId: "s22-6pm-3\t",
            tableOrBreakoutRoom: "7",
            requestTime: "2023-04-20T17:35:02.000Z",
            explanation: "DokkuIssue",
            solved: false,
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequests" });
    });

    // test("Changes when you click Update", async () => {
    //   render(
    //     <QueryClientProvider client={queryClient}>
    //       <MemoryRouter>
    //         <HelpRequestsEditPage />
    //       </MemoryRouter>
    //     </QueryClientProvider>,
    //   );

    //   await screen.findByTestId("HelpRequestForm-id");

    //   const idField = screen.getByTestId("HelpRequestForm-id");
    //   const reqEmailField = screen.getByLabelText("Requester Email");
    //   const teamIdField = screen.getByLabelText("Team Id");
    //   const tableOrBreakoutRoomField = screen.getByLabelText("Table or Breakout Room");
    //   const requestTimeField = screen.getByLabelText("Request Time");
    //   const explanationField = screen.getByLabelText("Explanation");
    //   const solvedField = screen.getByLabelText("Solved");
      
    //   const submitButton = screen.getByText("Update");

    //   expect(idField).toBeInTheDocument();
    //   expect(idField).toHaveValue("17");


    //   expect(reqEmailField).toBeInTheDocument();
    //   expect(reqEmailField).toHaveValue("sburicha@ucsb.edu");


    //   expect(teamIdField).toBeInTheDocument();
    //   expect(teamIdField).toHaveValue("s22-5pm-3\t");

    //   expect(tableOrBreakoutRoomField).toBeInTheDocument();
    //   expect(tableOrBreakoutRoomField).toHaveValue("5");

    //   expect(requestTimeField).toBeInTheDocument();
    //   expect(requestTimeField).toHaveValue("2022-04-20T17:35:01.000");

    //   expect(explanationField).toBeInTheDocument();
    //   expect(explanationField).toHaveValue("DokkuIssue");

    //   expect(solvedField).toBeInTheDocument();
    //   expect(solvedField).not.toBeChecked(); 

    //   expect(submitButton).toHaveTextContent("Update");

    //   fireEvent.change(nameField, {
    //     target: { value: "Freebirds World Burrito" },
    //   });
    //   fireEvent.change(descriptionField, { target: { value: "Big Burritos" } });

    //   fireEvent.click(submitButton);

    //   await waitFor(() => expect(mockToast).toBeCalled());
    //   expect(mockToast).toBeCalledWith(
    //     "HelpRequest Updated - id: 17 name: Freebirds World Burrito",
    //   );
    //   expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });
    // });
  });
});
