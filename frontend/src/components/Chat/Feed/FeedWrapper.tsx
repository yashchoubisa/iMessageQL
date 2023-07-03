import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface IFeedWrapperProps {
  session: Session
}

const FeedWrapper: React.FunctionComponent<IFeedWrapperProps> = ({session}) => {
  
  const router = useRouter();
  const { conversationId } = router.query
  return (
    <Flex width={'100%'} direction={'column'} display={{ base: conversationId ? 'flex' : 'none', md: 'flex' }}>
    { conversationId ? (
        <Flex>
          {conversationId}
        </Flex>
      ): (
        <div>No Conversation Selected</div>
      ) }
      </Flex>
      );
    };
    
    export default FeedWrapper;
    