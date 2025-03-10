"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "~/app/(components)/cache/manifest";
import { ErrorBoundary } from "react-error-boundary";
import { LRUCache } from "~/lib/shared/lru-cache";

function transformStringToStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    },
    cancel(reason) {
      console.error(
        `\x1b[31mrendering cancelled for the flight stream : \x1b[33m${reason}\x1b[37m`
      );
    }
  });
}

export function CacheClient({
  payload,
  cacheKey
}: {
  payload: string;
  cacheKey: string;
}) {
  if (typeof window === "undefined") {
    console.log("[SSR] before `use`");
  } else {
    console.log("[CSR] before `use`");
  }

  const element = React.use(resolveElementCached(payload));
  if (typeof window === "undefined") {
    console.log("[SSR] after `use`");
  } else {
    console.log("[CSR] after `use`");
  }
  return element;
}

/**
 * Custom `cache` function as `React.cache` doesn't work in the client
 * @param fn
 * @returns
 */
function fnCache<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  const cache = new LRUCache<Awaited<ReturnType<T>>>(100);

  return function cachedFn(
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    const key = JSON.stringify(args);
    return cache.get(key, async () => await fn(...args));
  } as T;
}

const resolveElementCached = fnCache(async function resolveElement(
  payload: string
) {
  const rscStream = transformStringToStream(payload);
  let rscPromise: Promise<React.JSX.Element> | null = null;

  // Render to HTML
  if (typeof window === "undefined") {
    console.log("running cache client for SSR...");
    // the SSR manifest contains all the client components that will be SSR'ed
    // And also how to import them
    rscPromise = RSDWSSr.createFromReadableStream(rscStream, getSSRManifest());
  }

  // Hydrate or CSR
  if (rscPromise === null) {
    console.log("running cache client for CSR...");

    rscPromise = RSDW.createFromReadableStream(rscStream, {});
  }

  return await rscPromise;
});

export function CacheErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, error);
        } else {
          console.error(`Error client rendering the cached component :`, error);
        }
        return (
          <div className="flex flex-wrap gap-2">
            <span className="text-xl font-semibold">
              Error rendering the cached component :
            </span>
            <code className="rounded-md bg-neutral text-red-400 px-1.5 py-1">
              {error.toString()}
            </code>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
