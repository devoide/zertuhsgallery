import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { supabase } from "../supabase/client";

export const ZertuhPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/upload";
    }
  };

  return (
    <Box p={8} maxW="md" mx="auto">
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {error && <Text color="red.400">{error}</Text>}
        <Button colorScheme="purple" onClick={handleLogin}>
          Login
        </Button>
      </VStack>
    </Box>
  );
};
