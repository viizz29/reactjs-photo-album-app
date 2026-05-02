import DynamicForm from "@/components/forms/dynamic-form";
import GenericModal from "@/components/modals/generic-modal";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';


interface NoteInputModalProps {
  open: boolean;
  onSubmit: (note: string) => void;
  onClose: () => void;
  title: string;
}


export default function NoteInputModal({ open, onClose, title, onSubmit }: NoteInputModalProps) {
  const { t } = useTranslation();

  const fields = ['note',];

  const validations = {
    note: Yup.string().required('Note is required'),
  };

  return (

    <GenericModal
      open={open}
      onClose={onClose}
      onCancel={onClose}
      title={title}
    >
      <DynamicForm
        fields={fields}
        validationSchema={validations}
        onSubmit={(values) => onSubmit(values.note)}
      />
    </GenericModal>

  );
}