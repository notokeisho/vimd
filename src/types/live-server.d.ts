declare module 'live-server' {
  export interface LiveServerParams {
    port?: number;
    host?: string;
    root?: string;
    open?: boolean;
    file?: string;
    wait?: number;
    logLevel?: number;
    middleware?: any[];
  }

  export function start(params: LiveServerParams): void;
  export function shutdown(): void;
}
