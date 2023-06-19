import { gql } from "apollo-server-core";

/**
 *  In type Query
 * EG: searchUsers, username is input and [User] is output i.e. array of Users
 * 
 * Type Mutation (CUD of CRUD operation)
 * EG: searchUsers
 * */

const typeDefs = gql`
type User {
    id: String
    username: String
}

type Query {
    searchUsers(username: String): [User]
}

type Mutation {
    createUsername(username: String): CreateUsernameResponse
}

type CreateUsernameResponse {
    success: Boolean,
    error: String
}
`;


export default typeDefs;