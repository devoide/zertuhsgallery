import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { PLAYER_BAR_HEIGHT, PlayerBar, useAudioPlayer } from "../audio";

export const Layout = () => {
  const { track } = useAudioPlayer();

  return (
    <>
      <Navigation />
      <Outlet />
      {/* room so the fixed player doesn't cover the bottom of the page */}
      {track && <Box h={PLAYER_BAR_HEIGHT} />}
      <PlayerBar />
    </>
  );
};
