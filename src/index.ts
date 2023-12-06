import { createKvCache } from "@envelop/response-cache-cloudflare-kv";
// import { YogaInitialContext, createSchema, createYoga } from "graphql-yoga";
import { cachified, Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "cachified-adapter-cloudflare-kv";

export interface Env {
  GRAPHQL_RESPONSE_CACHE: KVNamespace;
  CACHIFIED_KV_CACHE: Cache;
}

// export type GraphQLContext = YogaInitialContext & Env & ExecutionContext;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const kvCache = createKvCache({
      KV: env.GRAPHQL_RESPONSE_CACHE,
      ctx,
      keyPrefix: "graphql", // optional
    });
    env.CACHIFIED_KV_CACHE = cloudflareKvCacheAdapter({
      kv: env.GRAPHQL_RESPONSE_CACHE,
      keyPrefix: "mycache", // optional
      name: "CloudflareKV", // optional
    });
    // const yoga = createYoga<GraphQLContext>({
    //   schema: createSchema({
    //     typeDefs: /* GraphQL */ `
    //       type Query {
    //         hello(greeter: String): String!
    //       }
    //     `,
    //     resolvers: {
    //       Query: {
    //         hello: (_parent, args) => {
    //           if (args.greeter) {
    //             return `Hello ${args.greeter}!`;
    //           }
    //           return "Hello World!";
    //         },
    //       },
    //     },
    //   }),
    // });
    // return yoga.fetch(request, env, ctx);
    return new Response("Hello World!");
  },
};
