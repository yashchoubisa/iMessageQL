import { Prisma, PrismaClient } from "@prisma/client";
import { ISODateString, } from "next-auth";
import { conversationPopulated, participantPopulated } from "../graphql/resolvers/conversations";
import { Context } from "graphql-ws/lib/server"
import { PubSub } from "graphql-subscriptions"
/**
 * Server Config
 */
export interface GraphQlContext {
    session: Session | null;
    prisma: PrismaClient;
    pubsub:  PubSub;
}

export interface Session {
    user?: User;
}

export interface SubscriptionContext extends Context {
    connectionParams: {
        session?: Session;
    }
}



/**
* USERS
*/

export interface User {
    id: string;
    username: string;
}


//success and error -> any one will be present as a response so that we will use ?:
export interface CreateUsernameResponse {
    success?: boolean;
    error?: string;
}

/**
 * Conversations
 */
export type ConversationPopulated = Prisma.ConversationGetPayload<{ include: typeof conversationPopulated }>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload< { include: typeof participantPopulated } >
