import { Box, Text } from '@chakra-ui/react';
import { Session } from 'next-auth';
import ConversationModal from './Modal/Modal';
import { useState } from "react";
import { ConversationPopulated } from '../../../../../backend/src/util/types';
import ConversationItem from './ConversationItem';

interface IConversationListProps {
  session: Session
  conversations: Array<ConversationPopulated>
}

const ConversationList: React.FunctionComponent<IConversationListProps> = ({session, conversations}) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log('jbfhe', conversations);
  
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  return (
    <Box width="100%">
    <Box 
    py={2}
    px={4}
    mb={4}
    bg={'blackAlpha.300'}
    borderRadius={4}
    cursor={'pointer'}
    onClick={() => {}}
    >
    <Text textAlign={'center'} color={'whiteAlpha.800'} fontWeight={500} onClick={onOpen} >Find or start conversations</Text>
    </Box>
    <ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
    { conversations && conversations.map(conversation => <ConversationItem key={conversation.id} conversation={conversation} />) }
    </Box>
    )
  };
  
  export default ConversationList;
  