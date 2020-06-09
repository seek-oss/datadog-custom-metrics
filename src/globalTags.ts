import AppConfig from './AppConfig';

export default (config: AppConfig): string[] => {
  const { environment, version } = config;

  return [`env:${environment}`, ...(version ? [`version:${version}`] : [])];
};
