import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { createDataNode, getDataNodes, updateDataNodeOrder, type DataNode } from "@/api/image-apis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NoteInputModal from "@/components/modals/note-input-modal";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import { useNodeContextMenu } from "@/components/node-context-menu-provider";

// Sortable Item
const SortableItem: React.FC<{
  dataNode: DataNode;
  onContextMenu: (e: React.MouseEvent, student: DataNode) => void;
  children?: React.ReactNode;
}> = ({ dataNode, onContextMenu, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: dataNode.position });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => onContextMenu(e, dataNode)}
      className="p-3 my-2 bg-bg shadow rounded cursor-grab border"
    >
      {children}
    </div>
  );
};

interface ItemComponentProps {
  item: DataNode;
  initiallyExpanded?: boolean;
}


export function DataNodeItem({ item, initiallyExpanded = false }: ItemComponentProps) {

  const { openContextMenu } = useNodeContextMenu();

  const [localDataNodes, setLocalDataNodes] = useState<DataNode[]>([]);
  const [dragAndDropEnabled, setDragAndDropEnabled] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  // const [childItems, setChildItems] = useState<DataNode[]>(item.children);
  const queryClient = useQueryClient();
  const [noteInputModalOpen, setNoteInputModalOpen] = useState(false);

  const { data: childItems, isLoading } = useQuery({
    queryKey: ["data-nodes", item.id],
    queryFn: () => getDataNodes(item.id),
    enabled: expanded,
  });

  useEffect(() => {
    if (childItems) {
      setLocalDataNodes(childItems);
    }

  }, [childItems]);




  const createDataNodeMutation = useMutation({
    mutationFn: (note: string) => createDataNode(item.id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", item.id] });
    },
  });


  const reorderMutation = useMutation({
    mutationFn: updateDataNodeOrder,

    // 🔥 Optimistic Update
    onMutate: async (newNodes) => {
      await queryClient.cancelQueries({ queryKey: ["data-nodes", item.id] });

      const previous = queryClient.getQueryData<DataNode[]>(["data-nodes", item.id]);

      queryClient.setQueryData(["data-nodes", item.id], newNodes);

      return { previous };
    },

    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["data-nodes", item.id], context.previous);
      }
      toast.error("Failed to save order");
    },

    onSuccess: () => {
      toast.success("Order updated successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["data-nodes", item.id] });
    },
  });




  const handleDragEnd = (event: any) => {

    const { active, over } = event;

    console.log({ active, over });

    if (!over || active.id === over.id) return;

    const oldIndex = localDataNodes.findIndex((s) => s.position === active.id);
    const newIndex = localDataNodes.findIndex((s) => s.position === over.id);

    console.log("drag end", { oldIndex, newIndex });

    const updated = arrayMove(localDataNodes, oldIndex, newIndex).map((s, i) => ({
      ...s,
      position: i + 1,
    }));

    setLocalDataNodes(updated);
    reorderMutation.mutate(updated.map((item) => ({ id: item.id, position: item.position })));
  };



  const handleNoteCreation = (note: string) => {
    createDataNodeMutation.mutate(note);
    setNoteInputModalOpen(false);
  };



  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: "success.light",
            borderRadius: 1,
            cursor: "pointer",
          }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {item.position}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            backgroundColor: item.attributes?.backgroundColor,
            px: item.attributes?.backgroundColor ? 0.5 : 0,
            borderRadius: 1,
          }}
        >
          {item.note}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: "success.light",
            borderRadius: 1,
          }}
        >
          {item.id}
        </Typography>
      </Box>

      {expanded && (

        <Box ml={3} sx={{ p: 2 }}>

          {dragAndDropEnabled ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>


              <SortableContext items={localDataNodes.map((s) => s.position)} strategy={verticalListSortingStrategy}>
                {localDataNodes.map((child) => (
                  <SortableItem key={child.id} dataNode={child} onContextMenu={openContextMenu}>
                    <DataNodeItem key={child.id} item={child} />
                  </SortableItem>
                ))}
              </SortableContext>


            </DndContext>) : (

            localDataNodes.map((child) => (
              <div onContextMenu={(event) => openContextMenu(event, child)} key={child.id}>
                <DataNodeItem item={child} />
              </div>
            ))

          )}

          <Button onClick={() => setNoteInputModalOpen(true)}>add new</Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={dragAndDropEnabled}
                onChange={(e) => setDragAndDropEnabled(e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="caption">Enable Rearrange</Typography>}
          />
        </Box>
      )}

      <NoteInputModal open={noteInputModalOpen} onClose={() => setNoteInputModalOpen(false)} onSubmit={handleNoteCreation} title={"Add Note"} />

    </Box>
  );
}
