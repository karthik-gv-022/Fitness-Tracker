import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/api', () => ({
  register: jest.fn(),
  login: jest.fn(),
  me: jest.fn(),
  logout: jest.fn(),
  getWorkouts: jest.fn(),
  logWorkout: jest.fn(),
  updateWorkout: jest.fn(),
  deleteWorkout: jest.fn(),
  getGoal: jest.fn(),
  setGoal: jest.fn(),
  __esModule: true,
  default: {},
}));

test('renders login when unauthenticated', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
});