import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface IAuthProps {
    session: Session | null;
    reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({
    session,
    reloadSession,
}) => {
    const [username, setUsername] = useState("");
    const onSubmit = async () => {
        //GraphQl Mutation
        try {
            /**
             * create Usrname mututation to send our username to the GraphQl API
             */
        } catch (error) {
            console.log('onSubmit error', error);
            
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
            <Button onClick={onSubmit} width="100%" >
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
