// Configurar console para evitar warnings en tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
