import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Statistics from "../windows/Statistics";
import i18n from '../i18n';
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mocks
global.ResizeObserver = class {
  constructor(callback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

jest.mock("../components/NavBarSignedIn", () => () => <div data-testid="navbar" />);

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const theme = createTheme({
  palette: {
    secondary: {
      dark: "#000",
      main: "#fff",
      light: "#ccc"
    },
  },
});

// MOCK DATA
const mockData = {
  scores: [
    {
      _id: "1",
      userId: "testUser",
      score: 800,
      gameMode: "basicQuiz",
      questionsPassed: 8,
      questionsFailed: 2,
      accuracy: 80,
      date: "2023-09-01T12:00:00.000Z",
    },
    {
      _id: "2",
      userId: "testUser",
      score: 900,
      gameMode: "expertDomain",
      questionsPassed: 9,
      questionsFailed: 1,
      accuracy: 90,
      date: "2023-09-05T12:00:00.000Z",
    },
    {
      _id: "3",
      userId: "testUser",
      score: 750,
      gameMode: "basicQuiz",
      questionsPassed: 7,
      questionsFailed: 3,
      accuracy: 70,
      date: "2023-09-10T12:00:00.000Z",
    },
  ],
  totalGames: 3,
};

describe("Statistics view", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue("fakeToken");
    const { jwtDecode } = require("jwt-decode");
    jwtDecode.mockReturnValue({ userId: "testUser" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders loading state initially", () => {
    jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    render(
      <ThemeProvider theme={theme}>
        <Statistics />
      </ThemeProvider>
    );
    expect(screen.getByText(i18n.t("statistics.loading"))).toBeInTheDocument();
  });

  test("renders overview tab correctly with fetched data", async () => {
    // Mock fetch to return our fake scores data
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <ThemeProvider theme={theme}>
        <Statistics />
      </ThemeProvider>
    );

    // Wait until the loading text disappears and the title appears
    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.title"))).toBeInTheDocument();
    });

    // Check that summary items are rendered
    expect(screen.getByText(i18n.t("statistics.totalGames"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("statistics.totalQuestions"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("statistics.averageTime"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("statistics.correctAnswers"))).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("switches to Performance tab and renders line chart", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <ThemeProvider theme={theme}>
        <Statistics />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.title"))).toBeInTheDocument();
    });

    // Switch to Performance tab
    const performanceTab = screen.getByText(i18n.t("statistics.performance"));
    fireEvent.click(performanceTab);

    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.performanceOverTime"))).toBeInTheDocument();
    });
  });

  test("switches to Game Modes tab and renders bar chart", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <ThemeProvider theme={theme}>
        <Statistics />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.title"))).toBeInTheDocument();
    });

    // Switch to Game Modes tab
    const gameModesTab = screen.getByText(i18n.t("statistics.gameModes"));
    fireEvent.click(gameModesTab);

    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.gameModeComparison"))).toBeInTheDocument();
    });
  });

  test("renders fallback values when no scores are returned", async () => {
    // Return an empty scores array
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ scores: [] }),
    });

    render(
      <ThemeProvider theme={theme}>
        <Statistics />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(i18n.t("statistics.title"))).toBeInTheDocument();
    });

    expect(screen.getByText(i18n.t("statistics.totalGames"))).toBeInTheDocument();
    const zeroFields = screen.getAllByText("0");
    expect(zeroFields.length).toBe(2); // Two fields should show ONLY the string "0" by default
  });
});
