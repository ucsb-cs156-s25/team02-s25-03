import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("Article-title")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Some Article Title",
        url: "https://gmail.com",
        explanation: "The article is actually Gmail",
        email: "karena_lai@ucsb.edu",
        dateAdded: "2022-01-02T12:00:01",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "How to Be a Code Editor",
        url: "https://youtube.com",
        explanation: "Step-by-step guide on how to become a code editor",
        email: "youremail@gmail.com",
        dateAdded: "2024-04-28T12:00:02",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByLabelText("Date Added (iso format)");
      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue("Some Article Title");

      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue("https://gmail.com");

      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("The article is actually Gmail");

      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("karena_lai@ucsb.edu");

      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2022-01-02T12:00:01.000");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "How to Be a Code Editor" },
      });
      fireEvent.change(urlField, {
        target: { value: "https://youtube.com" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Step-by-step guide on how to become a code editor" },
      });
      fireEvent.change(emailField, {
        target: { value: "youremail@gmail.com" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2024-04-28T12:00:02" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Article Updated - id: 17 title: How to Be a Code Editor",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "How to Be a Code Editor",
          url: "https://youtube.com",
          explanation: "Step-by-step guide on how to become a code editor",
          email: "youremail@gmail.com",
          dateAdded: "2024-04-28T12:00:02.000",
        }),
      ); // posted object
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
    });
  });
});
