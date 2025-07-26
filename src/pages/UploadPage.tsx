import {
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { DrawingForm } from "../components/DrawingForm";
import { MusicForm } from "../components/MusicForm";
import { StoryForm } from "../components/StoryForm";

export function UploadPage() {
  return (
    <Container maxW={"6xl"} paddingY={10}>
      <Heading>Upload Zertuity</Heading>
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
            <p>manga</p>
          </TabPanel>
          <TabPanel>
            <StoryForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default UploadPage;
