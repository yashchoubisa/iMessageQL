import { ApolloError } from 'apollo-server-core';
import { ConversationPopulated, GraphQlContext } from '../../util/types';
import { Prisma } from '@prisma/client';

const resolvers = {
    Query: {
        conversations: async (_:any, __: any, context: GraphQlContext): Promise<Array<ConversationPopulated>> => {
            const { prisma, session } = context
            if (!session?.user) {
                throw new ApolloError("Not Authorized")
            }
            
            const { user: { id: userId } } = session;
            try {
                const conversations = await prisma.conversation.findMany({
                    include: conversationPopulated
                });
                
                return conversations.filter(c => !!c.participants.find(p => p.userId === userId))
                
            } catch (error: any) {
                console.log('conversations err', error);
                throw new ApolloError(error?.message)
            }
        }
    },
    
    
    Mutation: {
        createConversation: async (_:any, args: { participantIds: Array<string> }, context: GraphQlContext): Promise<{ conversationId: string }> => {
            console.log('INSIDE createConversation', args);
            const { participantIds } = args
            const { prisma, session, pubsub } = context
            
            if (!session?.user) {
                throw new ApolloError("Not Authorized")
            }
            
            const { user: {id: userId} } = session;
            try {
                const conversation = await prisma.conversation.create({
                    data: {
                        participants: {
                            createMany: {
                                data: participantIds.map(id => ({
                                    userId: id,
                                    hasSeenLatestMessage: id === userId,
                                }))
                            }
                        }
                    },
                    include: conversationPopulated
                })
                
                //Emit a CONVERSATION_CREATED event using pubsub 
                pubsub.publish('CONVERSATION_CREATED', {
                    conversationCreated: conversation
                })
                return {
                    conversationId: conversation.id
                }
            } catch (error: any) {
                console.log('createConversation err', error);
                throw new ApolloError(error?.message)
            }
            
        }
    },
    Subscription: {
        conversationCreated: {
            subscribe: (_: any, __: any, context: GraphQlContext) => {
                const { pubsub } = context;
                return pubsub.asyncIterator(['CONVERSATION_CREATED'])
            }
        }
    }
}

export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
        select: {
            id: true,
            username: true
        }
    }
})

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
        include: participantPopulated
    },
    latestMessage: {
        include: {
            sender: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    }
})

export default resolvers