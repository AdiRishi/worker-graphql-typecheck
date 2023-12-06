import { YogaInitialContext, createSchema, createYoga } from "graphql-yoga";

export interface Env {}

export type GraphQLContext = YogaInitialContext & Env & ExecutionContext;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const yoga = createYoga<GraphQLContext>({
      schema: createSchema({
        typeDefs: /* GraphQL */ `
          type Query {
            hello(greeter: String): String!
          }
        `,
        resolvers: {
          Query: {
            hello: (_parent, args) => {
              if (args.greeter) {
                return `Hello ${args.greeter}!`;
              }
              return "Hello World!";
            },
          },
        },
      }),
    });
    return yoga.fetch(request, env, ctx);
  },
};
