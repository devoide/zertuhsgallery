import { Box, Button, Input, VStack, Text, Field } from "@chakra-ui/react";
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
      <VStack gap={4} align="stretch">
        <Field.Root required>
          <Field.Label>Email</Field.Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field.Root>
        <Field.Root required>
          <Field.Label>Password</Field.Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>
        {error && <Text color="red.400">{error}</Text>}
        <Button colorScheme="purple" onClick={handleLogin}>
          Login
        </Button>
      </VStack>
    </Box>
  );
};
