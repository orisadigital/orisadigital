import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PIPELINE_STAGES, STAGE_COLORS } from "@/components/pipeline/pipelineStages";
import DealCard from "@/components/pipeline/DealCard";

export default function KanbanBoard({ deals, onMoveDeal, onDeleteDeal, onUpdateDeal }) {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (source.droppableId === "closed_won") return;
    onMoveDeal(draggableId, destination.droppableId);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pipeline Board</h2>
      <p className="mt-1 text-sm text-slate-500">Drag and drop deals between stages.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            return (
              <div key={stage.id} className="w-64 shrink-0">
                <div className="rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage.id] }}
                      />
                      <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[120px] p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? "bg-slate-100" : ""}`}
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index} isDragDisabled={deal.stage === "closed_won"}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <DealCard deal={deal} index={index} onDeleteDeal={onDeleteDeal} onUpdateDeal={onUpdateDeal} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-20 text-xs text-slate-300">
                            Drop deals here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}