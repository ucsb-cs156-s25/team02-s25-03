import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "jest-mock-console";

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
      id: 1,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestEditPage tests", () => {
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
      axiosMock
        .onGet("/api/recommendationRequest", { params: { id: 1 } })
        .timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
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
      axiosMock
        .onGet("/api/recommendationRequest", { params: { id: 1 } })
        .reply(200, {
          id: 1,
          requesterEmail: "requestor@gmail.com",
          professorEmail: "professor@gmail.com",
          dateRequested: "2022-03-14T15:00",
          dateNeeded: "2022-03-14T15:00",
          explanation: "explanation",
          done: false,
        });
      axiosMock.onPut("/api/recommendationRequest").reply(200, {
        id: "1",
        requesterEmail: "requester2@gmail.com",
        professorEmail: "professor2@gmail.com",
        dateRequested: "2022-03-14T15:00",
        dateNeeded: "2022-03-14T15:00",
        explanation: "explanation2",
        done: false,
      });
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-requesterEmail");
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-requesterEmail");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requestorEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toHaveValue("1");
      expect(requestorEmailField).toHaveValue("requestor@gmail.com");
      expect(professorEmailField).toHaveValue("professor@gmail.com");
      expect(dateRequestedField).toHaveValue("2022-03-14T15:00");
      expect(dateNeededField).toHaveValue("2022-03-14T15:00");
      expect(explanationField).toHaveValue("explanation");
      expect(doneField).toHaveValue("false");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent("Update");
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-requesterEmail");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requestorEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toHaveValue("1");
      expect(requestorEmailField).toHaveValue("requestor@gmail.com");
      expect(professorEmailField).toHaveValue("professor@gmail.com");
      expect(dateRequestedField).toHaveValue("2022-03-14T15:00");
      expect(dateNeededField).toHaveValue("2022-03-14T15:00");
      expect(explanationField).toHaveValue("explanation");
      expect(doneField).toHaveValue("false");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requestorEmailField, {
        target: { value: "requestor2@gmail.com" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "professor2@gmail.com" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2022-03-14T15:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2022-03-14T15:00" },
      });
      fireEvent.change(explanationField, { target: { value: "explanation2" } });
      fireEvent.change(doneField, { target: { value: false } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 1 requesterEmail: requester2@gmail.com",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequest" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "requestor2@gmail.com",
          professorEmail: "professor2@gmail.com",
          dateRequested: "2022-03-14T15:00",
          dateNeeded: "2022-03-14T15:00",
          explanation: "explanation2",
          done: "false",
        }),
      ); // posted object
    });
  });
});
