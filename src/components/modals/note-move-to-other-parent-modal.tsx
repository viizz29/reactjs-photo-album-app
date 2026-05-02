import type { DataNode } from "@/api/image-apis";
import DynamicForm from "@/components/forms/dynamic-form";
import GenericModal from "@/components/modals/generic-modal";
import { useTranslation } from "react-i18next";
import * as Yup from 'yup';


interface NoteMoveToOtherParentModalProps {
  dataNode: DataNode | null;
  onSubmit: (dataNode: DataNode, parentId: string) => void;
  onClose: () => void;
  title: string;
}


export default function MoveToOtherParentModal({ dataNode, onClose, title, onSubmit }: NoteMoveToOtherParentModalProps) {
  const { t } = useTranslation();

  const fields = ['parentId',];

  const validations = {
    parentId: Yup.string().required('ParentId is required'),
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
          initialValues={{ parentId: dataNode?.parentId }}
          validationSchema={validations}
          onSubmit={(values) => onSubmit(dataNode, values.parentId)}
        />}
    </GenericModal>

  );
}