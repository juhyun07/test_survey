'use client';

import React, { useState, useEffect, useMemo } from 'react';

// A simple path matching utility that extracts params.
const matchPath = (
  routePattern: string,
  currentPath: string
): { route: string; params: Record<string, string> } | null => {
  const paramNames: string[] = [];
  const regexPath = routePattern
    .replace(/([.+*?^[\]$|])/g, '\\$1') // Escape most special chars
    .replace(/\((?!\?)/g, '(') // Do not escape non-capturing group parentheses
    .replace(/\)/g, ')')
    .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

  try {
    const match = currentPath.match(new RegExp(`^${regexPath}$`));
    if (!match) {
      return null;
    }
    const params = match.slice(1).reduce((acc, value, index) => {
      acc[paramNames[index]] = value;
      return acc;
    }, {} as Record<string, string>);
    return { route: routePattern, params };
  } catch (e) {
    console.error('Invalid regex for pattern:', routePattern, e);
    return null;
  }
};

export interface PageComponentProps {
  params?: Record<string, string>;
}

interface HashRouterProviderProps {
  routes: Record<string, React.ComponentType<PageComponentProps>>;
  fallback: React.ComponentType<PageComponentProps>;
}

export const HashRouterProvider: React.FC<HashRouterProviderProps> = ({
  routes,
  fallback: FallbackComponent,
}) => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.location.hash.replace(/^#\/?/, '');
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace(/^#\/?/, ''));
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const MatchedComponent = useMemo(() => {
    const sortedRoutes = Object.keys(routes).sort((a, b) => b.length - a.length);
    for (const routePattern of sortedRoutes) {
      const match = matchPath(routePattern, currentPath);
      if (match) {
        const Component = routes[match.route];
        const props = { ...match.params, params: match.params };
        return <Component {...props} />;
      }
    }
    return FallbackComponent ? <FallbackComponent /> : null;
  }, [currentPath, routes, FallbackComponent]);

  return <>{MatchedComponent}</>;
};
