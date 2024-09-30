'use client'

import { AlertDialog } from '@/components/ui/alert-dialog'
import { ShowcaseType } from '@/models/showcase'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { useState } from 'react'
import { updateShowcasesPositions } from './actions'
import { ShowcaseCard } from './card'

export function ShowcasesList({
  showcases,
}: {
  showcases: ShowcaseType[] | null
}) {
  const [showcaseList, setShowcaseList] = useState(showcases || [])

  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(showcaseList)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setShowcaseList(items)

    const newOrder = items.map((item, index) => ({ id: item.id, order: index }))
    await updateShowcasesPositions(newOrder)
  }

  return (
    <AlertDialog>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="showcases" type="list" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {showcaseList &&
                showcaseList.length > 0 &&
                showcaseList.map((showcase, index) => (
                  <ShowcaseCard
                    key={showcase.id}
                    showcase={showcase}
                    index={index}
                  />
                ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </AlertDialog>
  )
}
