import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from "@graphql-tools/schema"
import * as dotenv from "dotenv";
import { getSession } from "next-auth/react";
import { GraphQlContext, Session, SubscriptionContext } from './util/types';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

async function main() {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);
  
  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql/subscriptions',
  });
  
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })
  
  /***
  * Context Params
  */
  const prisma = new PrismaClient();
  //pub sub
  const pubsub = new PubSub();
  
  const serverCleanup = useServer({ schema, 
    context: async (ctx: SubscriptionContext): Promise<GraphQlContext> => {
      if (ctx.connectionParams && ctx.connectionParams.session) {
        const { session } = ctx.connectionParams
        return {session, prisma, pubsub}
      }
      return { session: null, prisma, pubsub }
    } }, wsServer);
    
    const corsOptions = {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true //next auth can sent the authorization header along with the request
    }
    
    
    
    const server = new ApolloServer({
      schema,
      csrfPrevention: true,
      cache: 'bounded',
      context: async ({ req, res }): Promise<GraphQlContext> => {      
        const session = await getSession({ req });
        console.log('here session', session);
        return {
          session: session as Session,
          prisma,
          pubsub
        };
      },
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
        
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ],
    });
    await server.start();
    server.applyMiddleware({ app, cors: corsOptions });
    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  }
  
  main().catch((err) => {
    console.log(err);
    
  })