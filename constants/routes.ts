export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  AUTH_LOGIN: "/(auth)/login",
  AUTH_REGISTER: "/(auth)/register",
  API_HEALTH: "/api/health",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
