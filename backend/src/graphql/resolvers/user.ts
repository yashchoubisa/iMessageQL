import { User } from "@prisma/client";
import { CreateUsernameResponse, GraphQlContext } from "../../util/types";
import { ApolloError } from 'apollo-server-core';
const resolvers = {
    Query: {
        searchUsers: async (_: any, args: { username: string }, context: GraphQlContext): Promise<Array<User>> => {
            const {username: searchedUsername} = args;
            const { session, prisma } = context;

            if (!session?.user) {
                throw new ApolloError("Not Authorized");
            }

            const { user: { username: myUsername } } = session;
            try {
                const users = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: searchedUsername,
                            not: myUsername,
                            mode: 'insensitive' //Case sensitivity (Uppercase / lowercase)
                        }
                    }
                });
                return users;
            } catch (error: any) {
                console.log('searchUsers', error);
                throw new ApolloError(error?.message)
            }
        },
    },
    Mutation: {
        createUsername: async (_: any, args: { username: string }, context: GraphQlContext): Promise<CreateUsernameResponse> => {
            console.log('ola1');
            
            const { username } = args;
            const {prisma, session} = context
            console.log('ola2', username);
            if (!session?.user) {
                throw new ApolloError("Not Authorized");
            }

            if (!username) {
                return {
                    error: "Username is required"
                }
            }
            
            const { id: userId } = session.user;
            try {
                //Check username is taken or not
                const userExists = await prisma.user.findUnique({
                    where: {
                        username
                    }
                })
                if (userExists) {
                    return {
                        error: "Username already taken"
                    }
                }

                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        username
                    }
                });

                return {
                    success: true
                }
            } catch (error: any) {
                console.log('error at createUsername', error);
                return {
                    error: error?.message as string,
                }
            }
        }
    },
    // Subscription: {

    // }
}

export default resolvers;