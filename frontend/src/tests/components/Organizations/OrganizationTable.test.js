import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { organizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import OrganizationTable from "main/components/Organizations/OrganizationTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("Organization Table tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization ID",
    "Organization Translation Short",
    "Organization Translation",
    "Inactive",
  ];
  const expectedFields = [
    "orgCode",
    "orgTranslationShort",
    "orgTranslation",
    "inactive",
  ];
  const testId = "OrganizationTable";

  test("renders empty table correctly", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationTable organizations={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationTable
            organizations={organizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("DIVE");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("Diving");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("UCSB Diving Club");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("GAME");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslationShort`),
    ).toHaveTextContent("Gaming");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslation`),
    ).toHaveTextContent("Gaucho Gaming");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-inactive`),
    ).toHaveTextContent("true");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationTable
            organizations={organizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("DIVE");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("Diving");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("UCSB Diving Club");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("GAME");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslationShort`),
    ).toHaveTextContent("Gaming");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslation`),
    ).toHaveTextContent("Gaucho Gaming");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-inactive`),
    ).toHaveTextContent("true");

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationTable
            organizations={organizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("DIVE");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("Diving");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("UCSB Diving Club");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    // act - click the edit button
    fireEvent.click(editButton);

    // assert - check that the navigate function was called with the expected path
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/organizations/edit/DIVE"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/ucsborganization")
      .reply(200, { message: "Organization deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationTable
            organizations={organizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("DIVE");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("Diving");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("UCSB Diving Club");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "DIVE" });
  });
});
