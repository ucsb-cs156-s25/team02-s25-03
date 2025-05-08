import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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

describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Menu Item Review");
      expect(
        screen.queryByTestId("MenuItemReview-reviewerEmail"),
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
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 27,
          reviewerEmail: "cgaucho@ucsb.edu",
          stars: 3,
          dateReviewed: "2022-04-20T00:00:01",
          comments: "bland af but edible I guess",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: 17,
        itemId: 4,
        reviewerEmail: "cgaucho@ucsb.edua",
        stars: 2,
        dateReviewed: "2022-10-30T00:00:02",
        comments: "edible I guess",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByLabelText("Id");
      const itemIdField = screen.getByLabelText("Item ID");
      const reviewerEmailField = screen.getByLabelText("Reviewer Email");
      const starsField = screen.getByLabelText("Stars");
      const dateReviewedField = screen.getByLabelText(
        "Date Reviewed (iso format)",
      );
      const commentsField = screen.getByLabelText("Comments");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue(27);

      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("cgaucho@ucsb.edu");

      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(3);

      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2022-04-20T00:00:01.000");

      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("bland af but edible I guess");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, {
        target: { value: 4 },
      });
      fireEvent.change(reviewerEmailField, {
        target: { value: "cgaucho@ucsb.edua" },
      });
      fireEvent.change(starsField, {
        target: { value: 2 },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2022-10-30T00:00:02" },
      });
      fireEvent.change(commentsField, {
        target: { value: "edible I guess" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Menu Item Review Updated - id: 17 reviewerEmail: cgaucho@ucsb.edua comments: edible I guess",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "4",
          reviewerEmail: "cgaucho@ucsb.edua",
          stars: "2",
          dateReviewed: "2022-10-30T00:00:02.000",
          comments: "edible I guess",
        }),
      ); // posted object

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreview" });
    });
  });
});
