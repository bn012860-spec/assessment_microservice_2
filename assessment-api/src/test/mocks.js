import { vi } from 'vitest';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    isOpen: true,
    ping: vi.fn().mockResolvedValue('PONG'),
  })),
}));

vi.mock('amqplib', () => {
  const mockChannel = {
    assertQueue: vi.fn().mockResolvedValue({}),
    sendToQueue: vi.fn(),
    close: vi.fn(),
    connection: {},
  };
  const mockConnection = {
    createChannel: vi.fn().mockResolvedValue(mockChannel),
    close: vi.fn(),
  };
  return {
    default: {
      connect: vi.fn().mockResolvedValue(mockConnection),
    },
  };
});

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    schemaValid: true,
    typeValidation: true,
    wrapperGeneration: true,
    referenceSolutionPassed: true,
    errors: [],
    status: 'Accepted',
    passedCount: 1,
    totalCount: 1
  }),
});
