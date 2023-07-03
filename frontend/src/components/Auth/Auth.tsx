import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import UserOperations from "../../graphql/operations/user";
import { CreateUsernameData, CreateUsernameVariables } from "../../util/types";
import { toast } from "react-hot-toast";

interface IAuthProps {
    session: Session | null;
    reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({
    session,
    reloadSession,
}) => {
    const [username, setUsername] = useState("");
    const [createUsername, { loading, error }] = useMutation<CreateUsernameData, CreateUsernameVariables >(UserOperations.Mutations.createUsername);    
    const onSubmit = async () => {
        /**
        * Create Username mututation to send our username to the GraphQl API
        */
        if (!username) {
            toast.error("Please enter username");
            return;
        };
        try {
            const { data } = await createUsername({ variables: { username } });
            
            if (!data?.createUsername) {
                throw Error();
            }
            if (data.createUsername.error) {
                const { createUsername: {error} } = data;
                throw new Error(error);
            }            
            toast.success("Username successfully created!");
            /**
            * Reload session to obtain new username
            */
            reloadSession();
        } catch (error: any) {
            console.log('onSubmit error', error);
            toast.error(error?.message)
        }
    }
    return (
        <Center height='100vh'>
        <Stack align="center" spacing={8}>
        {
            session ? (
                <>
                <Text fontSize={'3xl'}>Create a Username</Text>
                <Input
                placeholder="Enter a username"
                value={username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(event.target.value)
                }
                />
                <Button onClick={onSubmit} width="100%" isLoading={loading}>
                Save
                </Button>
                
                </>
                ) : (
                    <>
                    <Text fontSize={"3xl"}>MessengerQL</Text>
                    <Button onClick={() => signIn('google')} 
                    leftIcon={<Image height="20px" src="/images/googlelogo.png" />}
                    >Continue with Google</Button>
                    </>
                    )
                }
                </Stack>
                </Center>
                )
            };
            
            export default Auth;
            