import type { DataNode, DataNodeBasicInfo } from "@/api/image-apis";
import DynamicForm from "@/components/forms/dynamic-form";
import GenericModal from "@/components/modals/generic-modal";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';


interface NoteEditingModalProps {
  dataNode: DataNode | null;
  onSubmit: (dataNode: DataNode, note: string) => void;
  onClose: () => void;
  title: string;
}


export default function NoteEditingModal({ dataNode, onClose, title, onSubmit }: NoteEditingModalProps) {
  const { t } = useTranslation();

  const fields = ['note',];

  const validations = {
    note: Yup.string().required('Note is required'),
  };

  return (

    <GenericModal
      open={dataNode !== null}
      onClose={onClose}
      onCancel={onClose}
      title={title}
    >

      {dataNode &&
        <DynamicForm
          fields={fields}
          initialValues={{ note: dataNode?.note }}
          validationSchema={validations}
          onSubmit={(values) => onSubmit(dataNode, values.note)}
        />}
    </GenericModal>

  );
}