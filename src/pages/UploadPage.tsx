import {
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
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
      <Heading mb={4}>Upload Zertuity</Heading>
      <Tabs>
        <TabList>
          <Tab>Drawing</Tab>
          <Tab>Music</Tab>
          <Tab>Manga</Tab>
          <Tab>Story</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DrawingForm />
          </TabPanel>
          <TabPanel>
            <MusicForm />
          </TabPanel>
          <TabPanel>
            <Text>manga</Text>
          </TabPanel>
          <TabPanel>
            <StoryForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
