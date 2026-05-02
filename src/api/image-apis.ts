import api from "./client";


export const uploadFileApi = async (
  file: File,
  onUploadProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/v1/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onUploadProgress?.(percent);
    },
  });

  return res.data;
};


export interface ImageWithCommentary {
  "id": string;
  "filename": string;
  "contentType": string;
  "createdAt": string;
  "commentary": string;
}

export const getRandomImage = async (): Promise<ImageWithCommentary> => {
  const res = await api.get("/v1/images/random");
  return res.data;
};


export const getImageFile = async (imageId: string): Promise<Blob> => {
  const res = await api.get(`/v1/images/${imageId}/file`, {
    responseType: "blob",
  });
  return res.data;
}