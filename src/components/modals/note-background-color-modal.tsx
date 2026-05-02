import type { DataNode } from "@/api/image-apis";
import ColorPickerModal from "@/components/modals/color-picker-modal";
import { useTranslation } from "react-i18next";



interface NoteBackgroundColorModalProps {
  dataNode: DataNode | null;
  onSubmit: (dataNode: DataNode, color: string) => void;
  onClose: () => void;
}


export default function NoteBackgroundColorModal({ dataNode, onClose, onSubmit }: NoteBackgroundColorModalProps) {
  const { t } = useTranslation();

  return (

    dataNode &&
    <ColorPickerModal
      open={dataNode !== null}
      onClose={onClose} onSubmit={(color) => onSubmit(dataNode, color)} />
  );
}