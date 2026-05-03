import { createAlbum } from "@/api/album-apis";
import AlbumTitleInputModal from "@/features/photos/album-name-input-modal";
import InfiniteScrollingImageGrid from "@/features/photos/infinite-scrolling-image-grid";
import SearchWidget from "@/features/photos/search-widget";
import { Box, Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PhotosPage() {

  const [albumTitleInputModalOpen, setAlbumTitleInputModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: ({ title }: { title: string }) =>
      createAlbum({ title, search: searchTerm }),

    onSuccess: (data) => {
      toast.info(`New album created!`);
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },

    onError: (error) => {
      console.error(error);
      alert("Could not create album." + JSON.stringify(error));
    },
  });


  const createAlbumHandler = (title: string) => {
    mutation.mutate({ title });
  }


  return <Box
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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <SearchWidget onInput={setSearchTerm} />

      <Button
        variant="contained"
        color="primary"
        onClick={() => setAlbumTitleInputModalOpen(true)}
      >
        Create Album With These Photos
      </Button>
    </Box>

    <InfiniteScrollingImageGrid searchTerm={searchTerm} />

    <AlbumTitleInputModal
      open={albumTitleInputModalOpen}
      onClose={() => setAlbumTitleInputModalOpen(false)}
      onSubmit={createAlbumHandler}
    />
  </Box>
}