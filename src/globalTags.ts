import type { AppConfig } from './AppConfig';

export const globalTags = (config: AppConfig): string[] => {
  const { environment } = config;

  return environment ? [`env:${environment}`] : [];
};
