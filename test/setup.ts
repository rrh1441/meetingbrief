// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    onInstalled: {
      addListener: jest.fn(),
    },
    lastError: undefined,
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
  },
  identity: {
    getRedirectURL: jest.fn(),
    launchWebAuthFlow: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
  notifications: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
    onButtonClicked: {
      addListener: jest.fn(),
    },
    clear: jest.fn(),
  },
  webNavigation: {
    onCompleted: {
      addListener: jest.fn(),
    },
  },
};

(global as any).chrome = mockChrome;

// Mock fetch
global.fetch = jest.fn();

// Mock DOMParser
global.DOMParser = class DOMParser {
  parseFromString(string: string, type: string) {
    const parser = require('jsdom').JSDOM;
    return new parser(string).window.document;
  }
}; 