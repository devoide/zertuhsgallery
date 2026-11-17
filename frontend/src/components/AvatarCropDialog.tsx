import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Slider,
  Text,
} from "@chakra-ui/react";

/** final avatar resolution; uploadAvatar shrinks to 256 anyway */
const OUTPUT_SIZE = 512;

/** cuts the selected square out of the image and returns it as a file */
async function cropToSquare(src: string, area: Area, name: string) {
  const img = new Image();
  img.src = src;
  await img.decode();

  const canvas = document.createElement("canvas");
  const size = Math.min(OUTPUT_SIZE, Math.round(area.width));
  canvas.width = canvas.height = size;
  canvas
    .getContext("2d")!
    .drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("Cropping failed");
  return new File([blob], name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

interface AvatarCropDialogProps {
  /** the picked file; the dialog is open while this is set */
  file: File | null;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

/** pick the visible part of a new avatar, always 1:1 */
export const AvatarCropDialog = ({
  file,
  onCancel,
  onCropped,
}: AvatarCropDialogProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load the picked file; reset position/zoom for each new one
  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const apply = async () => {
    if (!file || !src || !area) return;
    setBusy(true);
    try {
      onCropped(await cropToSquare(src, area, file.name));
    } catch (err) {
      console.error(err);
      setError("Couldn't crop that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root
      open={!!file}
      onOpenChange={(e) => !e.open && onCancel()}
      size={"md"}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>Crop picture</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box
                position={"relative"}
                w={"full"}
                aspectRatio={1}
                bg={"black"}
                rounded={"md"}
                overflow={"hidden"}
              >
                {src && (
                  <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape={"round"}
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, pixels) => setArea(pixels)}
                  />
                )}
              </Box>
              <HStack mt={4} gap={3}>
                <Text fontSize={"sm"} color={"gray.400"}>
                  Zoom
                </Text>
                <Slider.Root
                  flex={"1"}
                  size={"sm"}
                  min={1}
                  max={3}
                  step={0.01}
                  value={[zoom]}
                  onValueChange={(e) => setZoom(e.value[0])}
                  aria-label={["Zoom"]}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.Root>
              </HStack>
              {error && (
                <Text mt={3} fontSize={"sm"} color={"fg.error"}>
                  {error}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant={"outline"}
                size={"sm"}
                borderColor={"gray.600"}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button size={"sm"} loading={busy} onClick={apply}>
                Apply
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
