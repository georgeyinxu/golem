export interface IOption {
  routes: IRouteConfig[];
}

interface IRouteConfig {
  path: string;
  ttl: number;
}
