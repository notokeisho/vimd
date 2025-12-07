// tests/unit/server.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveServer } from '../../src/core/server';
import liveServer from 'live-server';
import { EventEmitter } from 'events';

// Create a mock server that extends EventEmitter
const createMockServer = (port: number) => {
  const mockServer = new EventEmitter() as EventEmitter & {
    address: () => { port: number };
  };
  mockServer.address = () => ({ port });

  // Emit 'listening' event immediately after addListener is called
  const originalAddListener = mockServer.addListener.bind(mockServer);
  mockServer.addListener = (event: string, listener: (...args: any[]) => void) => {
    originalAddListener(event, listener);
    if (event === 'listening') {
      setImmediate(() => mockServer.emit('listening'));
    }
    return mockServer;
  };

  return mockServer;
};

vi.mock('live-server', () => ({
  default: {
    start: vi.fn(() => createMockServer(8080)),
    shutdown: vi.fn(),
  },
}));

vi.mock('open', () => ({
  default: vi.fn(),
}));

describe('LiveServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create server instance', () => {
    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: true,
      root: '.',
    });

    expect(server).toBeDefined();
  });

  it('should start server with correct config', async () => {
    const startSpy = vi.mocked(liveServer.start);

    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: false,
      root: '/tmp',
    });

    await server.start('/tmp/test.html');

    expect(startSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
        host: 'localhost',
        root: '/tmp',
        file: 'test.html',
      })
    );
  });

  it('should stop server', async () => {
    const shutdownSpy = vi.mocked(liveServer.shutdown);

    const server = new LiveServer({
      port: 8080,
      host: 'localhost',
      open: false,
      root: '/tmp',
    });

    // Start server first
    await server.start('/tmp/test.html');

    // Then stop it
    await server.stop();

    expect(shutdownSpy).toHaveBeenCalled();
  });
});
