// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock Swiper modules and CSS to prevent Jest from resolving ESM/CSS imports
jest.mock('swiper/modules', () => ({
  Navigation: {},
}), { virtual: true });

jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'swiper' }, children);
  },
  SwiperSlide: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'slide' }, children);
  },
}), { virtual: true });

// Mock CSS bundle import
jest.mock('swiper/css/bundle', () => ({}), { virtual: true });
