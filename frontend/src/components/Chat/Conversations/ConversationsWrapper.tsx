import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationsList";
import { useQuery } from "@apollo/client";
import ConversationsOperations from "../../../graphql/operations/conversations";
import { ConversationData } from "../../../util/types";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react"
interface IConversationWrapperProps {
  session: Session
}

const ConversationWrapper: React.FC<IConversationWrapperProps> = ({session}) => {
  const { data: conversationsData, loading: conversationsLoading, error: conversationsError, subscribeToMore
   } = useQuery<ConversationData>(ConversationsOperations.Queries.conversations)
  
  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationsOperations.Subscriptions.conversationCreated,
      updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { conversationCreated: ConversationPopulated } } }) => {
        if (!subscriptionData.data) return prev;

        const newConversation = subscriptionData.data.conversationCreated
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations, ]
        })
      }
    })
  }
  /**
   * Execute subscription on mount
   */
  useEffect(() => {
    subscribeToNewConversations();
  }, [])
  
  return (
    <Box width={{ base: '100%', md: '400px' }} bg={'whiteAlpha.50'} py={6} px={3}>
      {/* Skeleton Loader */}
      <ConversationList session={session} conversations={conversationsData?.conversations || []} />
    </Box>
  )
};

export default ConversationWrapper;
