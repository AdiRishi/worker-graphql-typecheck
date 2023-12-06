import { createKvCache } from "@envelop/response-cache-cloudflare-kv";
import { YogaInitialContext, createSchema, createYoga } from "graphql-yoga";
import { cachified, Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "cachified-adapter-cloudflare-kv";
// import { KVNamespace } from "@cloudflare/workers-types"; // Enable this to remove the Typescript error
import { useResponseCache } from "@envelop/response-cache";

export interface Env {
  GRAPHQL_RESPONSE_CACHE: KVNamespace;
  CACHIFIED_KV_CACHE: Cache;
}

export type GraphQLContext = YogaInitialContext & Env & ExecutionContext;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const kvCache = createKvCache({
      KV: env.GRAPHQL_RESPONSE_CACHE,
      ctx,
      keyPrefix: "graphql", // optional
    });
    // Using cachified to check of other packages are effected the same way with the Typescript error
    env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
      kv: env.GRAPHQL_RESPONSE_CACHE,
      keyPrefix: "cachified", // optional
      name: "CloudflareKV", // optional
    });
    const yoga = createYoga<GraphQLContext>({
      schema: createSchema({
        typeDefs: /* GraphQL */ `
          type Query {
            hello(greeter: String): String!
          }
        `,
        resolvers: {
          Query: {
            hello: (_parent, args, ctx) => {
              return cachified({
                cache: ctx.CACHIFIED_KV_CACHE,
                key: "hello",
                ttl: 1000 * 10, // 10 seconds
                getFreshValue: () => {
                  if (args.greeter) {
                    return `Hello ${args.greeter}!`;
                  }
                  return "Hello World!";
                },
              });
            },
          },
        },
      }),
      plugins: [
        useResponseCache({
          cache: kvCache,
          session: () => null,
          includeExtensionMetadata: true,
          ttl: 1000 * 10, // 10 seconds
        }),
      ],
    });
    return yoga.fetch(request, env, ctx);
  },
};
