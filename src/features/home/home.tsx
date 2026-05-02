import { getRandomImage } from "@/api/image-apis";
import { getPersons, updatePersonName, type Person } from "@/api/person-apis";
import FileUploadModal from "@/features/home/file-upload-modal";
import ImageComponent from "@/features/home/image-with-commentary";
import PersonNameUpdateModal from "@/features/home/name-update-modal";
import PersonFace from "@/features/home/person-face-component";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CollectionsIcon from "@mui/icons-material/Collections";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function Home() {
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);

  const [personWhoseNameToEdit, setPersonWhoseNameToEdit] = useState<Person | null>(null);

  const {
    data: randomImage,
    isError,
    isLoading
  } = useQuery({
    queryKey: ["a-random-image"],
    queryFn: getRandomImage
  });


  const {
    data: persons,
  } = useQuery({
    queryKey: ["persons"],
    queryFn: getPersons
  });

  const queryClient = useQueryClient();

  const updatePersonNameMutation = useMutation({
    mutationFn: (person: Person) => updatePersonName(person.id, person.name),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });


  const handleNameEditingStep2 = (person: Person, name: string) => {
    updatePersonNameMutation.mutate({ ...person, name });
    setPersonWhoseNameToEdit(null);
  };


  return (
    <Box
      sx={{
        minHeight: "100%",
        borderRadius: 2,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(25, 118, 210, 0.22), rgba(156, 39, 176, 0.12) 45%, rgba(18, 18, 18, 0) 72%)"
            : "linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(236, 64, 122, 0.08) 46%, rgba(255, 255, 255, 0) 72%)",
        p: { xs: 2, md: 4 }
      }}
    >
      <Stack spacing={3}>

        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper"
          }}
        >
          {persons && persons.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
                p: 3
              }}
            >
              {persons.map((person) => (
                <PersonFace
                  key={person.id}
                  person={person}
                  size={76}
                  onEditName={() => setPersonWhoseNameToEdit(person)}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info" icon={<AutoAwesomeIcon />} sx={{ m: 3 }}>
              No persons found. Upload photos with recognizable faces to populate this list.
            </Alert>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper"
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 5 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            sx={{ p: { xs: 3, md: 4 } }}
          >
            <Stack spacing={2} sx={{ maxWidth: 680 }}>
              <Chip
                icon={<CollectionsIcon />}
                label="AI Photo Album"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: "flex-start", fontWeight: 600 }}
              />
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    mb: 1
                  }}
                >
                  Bring your memories into focus.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 560, fontSize: "1.05rem" }}
                >
                  Upload a favorite photo and let the album surface a moment with a little story around it.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => setImageUploadModalOpen(true)}
              sx={{
                alignSelf: { xs: "stretch", sm: "flex-start", md: "center" },
                borderRadius: 2,
                px: 3,
                py: 1.25,
                fontWeight: 700,
                boxShadow: 3
              }}
            >
              Upload Photo
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "hidden"
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ p: { xs: 3, md: 4 } }}
          >
            <Stack spacing={2} sx={{ flex: "1 1 36%", minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(144, 202, 249, 0.14)"
                        : "rgba(25, 118, 210, 0.1)"
                  }}
                >
                  <AutoAwesomeIcon />
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Today&apos;s pick
                  </Typography>
                  <Typography variant="h5" component="h2" fontWeight={800}>
                    Random Image of the Day
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {isLoading && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={22} />
                  <Typography color="text.secondary">Finding a photo worth revisiting...</Typography>
                </Stack>
              )}

              {isError && (
                <Alert severity="error">
                  Could not load the random image right now.
                </Alert>
              )}

              {!isLoading && !isError && randomImage && (
                <>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {randomImage.commentary || "A quiet little memory from your collection."}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {randomImage.filename && <Chip size="small" label={randomImage.filename} />}
                    {randomImage.contentType && (
                      <Chip size="small" variant="outlined" label={randomImage.contentType} />
                    )}
                  </Stack>
                </>
              )}

              {!isLoading && !isError && !randomImage && (
                <Alert icon={<ImageSearchIcon />} severity="info">
                  Upload a photo to start building your album.
                </Alert>
              )}
            </Stack>

            {randomImage && (
              <Box
                sx={{
                  flex: "1 1 64%",
                  minWidth: 0,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  "& img": {
                    display: "block",
                    width: "100%",
                    maxHeight: { xs: 360, md: 540 },
                    objectFit: "contain"
                  }
                }}
              >
                <ImageComponent imageId={randomImage.id} />
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>

      <FileUploadModal
        open={imageUploadModalOpen}
        onClose={() => setImageUploadModalOpen(false)}
        title="Upload Photo"
      />

      <PersonNameUpdateModal person={personWhoseNameToEdit} onClose={() => setPersonWhoseNameToEdit(null)} onSubmit={handleNameEditingStep2} title={"Update Name"} />
    </Box>
  );
}
