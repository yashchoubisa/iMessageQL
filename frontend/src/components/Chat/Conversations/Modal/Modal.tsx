import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text, Modal, Stack, Input } from '@chakra-ui/react';
import { useState } from "react";
import UserOperations from '../../../../graphql/operations/user';
import { CreateConversationInputs, SearchUsersData, SearchUsersInput, SearchedUser, CreateConversationData } from '../../../../util/types';
import UserSearchList from './UserSearchList';
import Participants from './Participants';
import { toast } from "react-hot-toast";
import ConversationOperations from '../../../../graphql/operations/conversations';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';


interface ConversationalModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session
}


const ConversationalModal: React.FC<ConversationalModalProps> = ({ isOpen, onClose, session }) => {
    const { user: { id: userId } } = session;
    const router = useRouter();

    const [username, setUsername] = useState("")
    const [participants, setParticipants] = useState<Array<SearchedUser>>([])
    

    const [searchUsers, { data, loading, error }] = useLazyQuery<SearchUsersData, SearchUsersInput>(UserOperations.Queries.searchUsers);
    const [createConversation, { loading: createConversationLoading }] = useMutation<CreateConversationData, CreateConversationInputs>(ConversationOperations.Mutations.createConversation);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        //searchUsers query
        searchUsers({ variables: { username } })
    }

    const addParticipant = (user: SearchedUser) => {
        setParticipants(prev => [...prev, user]);
        setUsername('');
    }

    const removeParticipant = (userId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== userId));
    }

    console.log('SEARCHED DATA', data);
    
    const onCreateConversation = async () => {
        try {
            const participantIds = [ ...participants.map(p => p.id), userId];
            // Conversation mutation
            console.log('participantIds', participantIds);
            
           const { data, errors } = await createConversation({
                variables: {participantIds}
            })
        //     console.log('ola', data);
        if (!data?.createConversation || errors) {
            throw new Error("Failed to create conversation");
          }
          const { createConversation: { conversationId } } = data;
          router.push({ query: { conversationId } })

          /**
           * Clear state and close modal on successfull creation
           */
          setParticipants([]);
          setUsername("");
          onClose();

        } catch (error: any) {
            console.log('onCreateConversation err', error);
            toast.error(error?.message)
        }
    }

    return (
        <>    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={'#2d2d2d'} pb={4}>
              <ModalHeader>Create a conversation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <form onSubmit={onSearch}>
                    <Stack spacing={4}>
                        <Input placeholder='Enter a username' value={username} onChange={(e) => { setUsername(e.target.value) }} />
                        <Button type="submit" disabled={!username} isLoading={loading}>Search</Button>
                    </Stack>
                </form>
                { data?.searchUsers && <UserSearchList users={data?.searchUsers} addParticipant={addParticipant}  /> }
                { participants.length > 0 && 
                <>
                <Participants participants={participants} removeParticipants={removeParticipant} />
                <Button 
                bg={'brand.100'} width={'100%'} mt={6} _hover={{ bg: 'brand.100' }} 
                onClick={onCreateConversation}
                isLoading={createConversationLoading}
                 >Create Conversation</Button>
                </>
                }
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )
};

export default ConversationalModal;
