import {
  Center,
  Container,
  Heading,
  Spinner,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { DrawingForm } from "../components/DrawingForm";
import { MusicForm } from "../components/MusicForm";
import { StoryForm } from "../components/StoryForm";

export default function UploadPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  if (!isLoggedIn) {
    return <Text>Ur not allowed to post. Only Zertuh is.</Text>;
  }

  return (
    <Container maxW={"6xl"} py={10}>
      <Heading mb={4} size={"4xl"} fontWeight={"bold"}>
        Upload Zertuity
      </Heading>
      <Tabs.Root defaultValue="drawing">
        <Tabs.List>
          <Tabs.Trigger value="drawing">Drawing</Tabs.Trigger>
          <Tabs.Trigger value="music">Music</Tabs.Trigger>
          <Tabs.Trigger value="manga">Manga</Tabs.Trigger>
          <Tabs.Trigger value="story">Story</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="drawing">
          <DrawingForm />
        </Tabs.Content>
        <Tabs.Content value="music">
          <MusicForm />
        </Tabs.Content>
        <Tabs.Content value="story">
          <StoryForm />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
