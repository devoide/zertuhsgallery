import { Button, Heading, HStack, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  let navigate = useNavigate();
  const paddingX = useBreakpointValue({
    base: 4,
    md: 10,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  return (
    <HStack
      shadow={"sm"}
      paddingY={4}
      paddingX={paddingX}
      position={"sticky"}
      top={0}
      bg={"gray.900"}
      zIndex={"banner"}
      justify={"space-between"}
    >
      <Heading
        size={{ base: "3xl", md: "4xl" }}
        fontWeight={"bold"}
        onClick={() => navigate("/")}
        _hover={{ cursor: "pointer" }}
      >
        Zertuh's Gallery
      </Heading>
      {isLoggedIn && (
        <Button
          variant={"outline"}
          onClick={() => {
            navigate("/upload");
          }}
        >
          Upload
        </Button>
      )}
    </HStack>
  );
};
