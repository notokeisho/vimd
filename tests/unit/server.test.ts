// tests/unit/server.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveServer } from '../../src/core/server';
import * as liveServer from 'live-server';

vi.mock('live-server', () => ({
  start: vi.fn(),
  shutdown: vi.fn(),
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
