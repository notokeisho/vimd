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
    watch?: string[];
    ignore?: string;
    ignorePattern?: RegExp;
    mount?: [string, string][];
    noBrowser?: boolean;
    noCssInject?: boolean;
    proxy?: Array<[string, string]>;
    cors?: boolean;
    htpasswd?: string;
    https?: string;
    cert?: string;
    key?: string;
    spa?: boolean;
  }

  export function start(params: LiveServerParams): void;
  export function shutdown(): void;
  export const server: any;
  export const watcher: any;
  export let logLevel: number;
}
