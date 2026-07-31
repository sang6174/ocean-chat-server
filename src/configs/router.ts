type RouteHandler = (
  req: Request,
  corsHeaders: Record<string, string>,
  params: Record<string, string>
) => Response | Promise<Response>;

interface RouteEntry {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: RouteEntry[] = [];

  add(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const regexSource = path.replace(/:([^/]+)/g, (_: string, name: string) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new RegExp(`^${regexSource}$`),
      paramNames,
      handler,
    });
  }

  get(path: string, handler: RouteHandler): void {
    this.add("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.add("POST", path, handler);
  }

  put(path: string, handler: RouteHandler): void {
    this.add("PUT", path, handler);
  }

  delete(path: string, handler: RouteHandler): void {
    this.add("DELETE", path, handler);
  }

  match(
    method: string,
    path: string
  ): { handler: RouteHandler; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      const matches = route.pattern.exec(path);
      if (!matches) continue;
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = matches[i + 1]!;
      });
      return { handler: route.handler, params };
    }
    return null;
  }
}

export const router = new Router();
