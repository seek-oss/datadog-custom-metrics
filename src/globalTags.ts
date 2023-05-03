import type { AppConfig } from './AppConfig';

export const globalTags = (config: AppConfig): string[] => {
  const { environment, version } = config;

  return [`env:${environment}`, ...(version ? [`version:${version}`] : [])];
};
