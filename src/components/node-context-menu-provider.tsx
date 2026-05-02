import { createBookmark } from "@/api/bookmark-apis";
import { deleteDataNode, moveNodeToOtherParent, updateDataNode, updateDataNodeAttributes, type DataNode, type DataNodeBasicInfo } from "@/api/image-apis";
import { useContextMenu } from "@/components/context-menu-provider";
import NoteBackgroundColorModal from "@/components/modals/note-background-color-modal";
import NoteDeletionModal from "@/components/modals/note-deletion-confirmation-modal";
import NoteEditingModal from "@/components/modals/note-editing-modal";
import MoveToOtherParentModal from "@/components/modals/note-move-to-other-parent-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";


type NodeContextMenuContextType = {
  openContextMenu: (e: React.MouseEvent, dataNode: DataNode) => void;
}

const NodeContextMenuContext = createContext<NodeContextMenuContextType | null>(null);

export const NodeContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {


  const [selectedItem, setSelectedItem] = useState<DataNode | null>(null);

  const { openContextMenu, closeMenu, setMenuItems } = useContextMenu();

  const [noteToEdit, setNoteToEdit] = useState<DataNode | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<DataNode | null>(null);
  const [nodeSelectedForBackgroundColorChange, setNodeSelectedForBackgroundColorChange] = useState<DataNode | null>(null);
  const [nodeToMoveToOtherParent, setNodeToMoveToOtherParent] = useState<DataNode | null>(null);


  const queryClient = useQueryClient();


  const openContextMenuWrapper = (e: React.MouseEvent, item: DataNode) => {
    openContextMenu(e);
    setSelectedItem(item);
  }


  const createBookmarkMutation = useMutation({
    mutationFn: (item: DataNode) => createBookmark(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });



  const updateDataNodeMutation = useMutation({
    mutationFn: (dataNode: DataNode) => updateDataNode(dataNode.id, dataNode.note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", variables.parentId] });
    },
  });

  const deleteDataNodeMutation = useMutation({
    mutationFn: (dataNode: DataNode) => deleteDataNode(dataNode.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", variables.parentId] });
    },
  });


  const updateNodeAttributesMutation = useMutation({
    mutationFn: (dataNode: DataNode) => updateDataNodeAttributes(dataNode.id, dataNode.attributes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", variables.parentId] });
    },
  });


  const moveNodeToOtherParentMutation = useMutation({
    mutationFn: (dataNode: DataNode) => moveNodeToOtherParent(dataNode.id, dataNode.parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", variables.parentId] });
    },
  });


  const handleNoteEditingStep2 = (dataNode: DataNode, note: string) => {
    updateDataNodeMutation.mutate({ ...dataNode, note });
    setNoteToEdit(null);
  };

  const handleNodeDeletionStep2 = (dataNode: DataNode) => {
    deleteDataNodeMutation.mutate(dataNode);
    setNodeToDelete(null);
  };

  const setNodeSelectedForBackgroundColorChangeStep2 = (node: DataNode, color: string) => {
    const attributes = node.attributes;
    const newAttributes = { ...attributes, background_color: color };
    updateNodeAttributesMutation.mutate({ ...node, attributes: newAttributes });
    setNodeSelectedForBackgroundColorChange(null);
  };

  const handleNoteMovingToOtherParentStep2 = (node: DataNode, parentId: string) => {
    moveNodeToOtherParentMutation.mutate({ ...node, parentId });

    setNodeToMoveToOtherParent(null);
  };



  useEffect(() => {
    setMenuItems([
      {
        caption: "Edit",
        handler: () => {
          if (!selectedItem) return;
          setNoteToEdit(selectedItem);
          setSelectedItem(null);
          closeMenu();
        },
      },
      {
        caption: "Bookmark",
        handler: () => {
          if (!selectedItem) return;
          createBookmarkMutation.mutate(selectedItem);
          setSelectedItem(null);
          closeMenu();
        },
      },
      {
        caption: "Delete",
        handler: () => {
          if (!selectedItem) return;
          setNodeToDelete(selectedItem);
          setSelectedItem(null);
          closeMenu();
        },
      },
      {
        caption: "Move to other parent",
        handler: () => {
          if (!selectedItem) return;
          setNodeToMoveToOtherParent(selectedItem);
          setSelectedItem(null);
          closeMenu();
        },
      },
      {
        caption: "Open in new tab",
        handler: () => {
          if (!selectedItem) return;
          window.open(`/explore/${selectedItem.id}`);
          setSelectedItem(null);
          closeMenu();
        },
      },
      {
        caption: "Change Background color",
        handler: () => {
          if (!selectedItem) return;
          setNodeSelectedForBackgroundColorChange(selectedItem);
          setSelectedItem(null);
          closeMenu();
        },
      },
    ]
    );
  }, [selectedItem]);

  return <NodeContextMenuContext.Provider value={{ openContextMenu: openContextMenuWrapper }}>
    {children}

    <NoteEditingModal dataNode={noteToEdit} onClose={() => setNoteToEdit(null)} onSubmit={handleNoteEditingStep2} title={"Edit Note"} />

    <NoteDeletionModal dataNode={nodeToDelete} onCancel={() => setNodeToDelete(null)} onSubmit={handleNodeDeletionStep2} />
    <NoteBackgroundColorModal dataNode={nodeSelectedForBackgroundColorChange} onClose={() => setNodeSelectedForBackgroundColorChange(null)} onSubmit={setNodeSelectedForBackgroundColorChangeStep2} />

    <MoveToOtherParentModal dataNode={nodeToMoveToOtherParent} onClose={() => setNodeToMoveToOtherParent(null)} onSubmit={handleNoteMovingToOtherParentStep2} title={"Move to other parent"} />

  </NodeContextMenuContext.Provider>

};

export const useNodeContextMenu = () => {
  const context = useContext(NodeContextMenuContext);
  if (!context) {
    throw new Error("useNodeContextMenu must be used within ContextMenuProvider");
  }
  return context;
}
