import MetricsClient from './MetricsClient';

/**
 * Vendored from `dgram.Socket`
 */
interface DgramSocket {
  close(callback?: () => void): void;
}

/**
 * Vendored from `hot-shots.Tags`
 */
type Tags = { [key: string]: string } | string[];

/**
 * Vendored from `hot-shots.ClientOptions`
 */
interface ClientOptions {
  errorHandler?: (err: Error) => void;
  globalTags?: Tags;
  host?: string;
  mock?: boolean;
  prefix?: string;
  socket?: DgramSocket;
}

/**
 * Vendored from `hot-shots.StatsD` so that TypeScript consumers are not forced
 * to install `hot-shots` when they are not using `createStatsDClient`.
 */
export class StatsD implements MetricsClient {
  constructor(options?: ClientOptions);

  socket?: DgramSocket;

  decrement(name: string, count: number, tags?: string[]): void;
  decrement(name: string, tags?: string[]): void;
  histogram(name: string, value: number, tags?: string[]): void;
  increment(name: string, count: number, tags?: string[]): void;
  increment(name: string, tags?: string[]): void;
  timing(name: string, value: number, tags?: string[]): void;
}
