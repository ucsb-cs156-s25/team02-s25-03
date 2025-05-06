import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestsFixtures";

import { QueryClient, QueryClientProvider } from "react-query";
import { removeZ } from "main/components/HelpRequests/HelpRequestForm";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm
            initialContents={helpRequestFixtures.oneHelpRequest}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();

    expect(screen.getByLabelText("Id")).toHaveValue(
      String(helpRequestFixtures.oneHelpRequest.id),
    );
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      helpRequestFixtures.oneHelpRequest.requesterEmail,
    );
    expect(screen.getByLabelText("Team Id")).toHaveValue(
      helpRequestFixtures.oneHelpRequest.teamId,
    );
    expect(screen.getByLabelText("Table or Breakout Room")).toHaveValue(
      helpRequestFixtures.oneHelpRequest.tableOrBreakoutRoom,
    );
    expect(screen.getByLabelText("Explanation")).toHaveValue(
      helpRequestFixtures.oneHelpRequest.explanation,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/requesterEmail is required/);
    expect(screen.getByText(/teamId is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/tableOrBreakoutRoom is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/requestTime is required/)).toBeInTheDocument();
    expect(screen.getByText(/explanation is required/)).toBeInTheDocument();

    const nameInput = screen.getByTestId(`${testId}-requesterEmail`);
    fireEvent.change(nameInput, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });

  test("that removeZ function works properly", () => {
    expect(removeZ("ABC")).toBe("ABC");
    expect(removeZ("ABCZ")).toBe("ABC");
  });
});
