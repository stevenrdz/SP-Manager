// Jest setup file
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sp-manager-test'
process.env.SQL_SERVER = process.env.SQL_SERVER || 'localhost'
process.env.SQL_USER = process.env.SQL_USER || 'sa'
process.env.SQL_PASSWORD = process.env.SQL_PASSWORD || 'password'
process.env.SQL_DATABASE = process.env.SQL_DATABASE || 'master'
process.env.SQL_PORT = process.env.SQL_PORT || '1433'

// Global test timeout
jest.setTimeout(10000)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
