import { OrderItemsType } from '@/models/order'
import { create } from 'zustand'

type RowSelectionState = Record<string, boolean>

type Updater<T> = T | ((old: T) => T)

interface TableStore {
  rowSelection: RowSelectionState
  setRowSelection: (newSelection: Updater<RowSelectionState>) => void
  items: OrderItemsType[] // Estado dos itens da compra
  setItems: (newItems: OrderItemsType[]) => void // Função para atualizar os itens
  splitItem: (item: OrderItemsType, parts: number) => void // Função para dividir um item
  updateItemPayment: (id: string, isPaid: boolean) => void // Atualiza o pagamento do item
}

// Função que divide um item em partes
function splitItem(item: OrderItemsType, parts: number) {
  const partPrice = item.product_price / parts // Preço de cada parte
  const newItems: OrderItemsType[] = []

  for (let i = 0; i < parts; i++) {
    newItems.push({
      ...item,
      id: `${item.id}-part-${i + 1}`, // Gerar um novo ID para cada parte
      products: {
        ...item.products,
        name: `${item.products.name} ${i + 1}/${parts}`, // Nome com a fração
      },
      product_price: partPrice, // Preço ajustado
    })
  }

  return newItems
}

export const useCloseBillStore = create<TableStore>((set) => ({
  rowSelection: {},
  setRowSelection: (newSelection) =>
    set((state) => ({
      rowSelection:
        typeof newSelection === 'function'
          ? newSelection(state.rowSelection)
          : newSelection,
    })),
  items: [], // Inicialmente vazio, será preenchido com os dados da compra
  setItems: (newItems) => set({ items: newItems }), // Atualiza os itens
  splitItem: (item, parts) => {
    const newItems = splitItem(item, parts) // Função para dividir o item em várias partes
    set((state) => ({
      items: [
        ...newItems, // Adiciona os novos itens
        ...state.items.filter((i) => i.id !== item.id), // Remove o item original
      ],
    }))
  },
  updateItemPayment: (id, isPaid) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, is_paid: isPaid } : item,
      )

      // Se for um item particionado, pegar o ID original
      const originalId = id.includes('-part-') ? id.split('-part-')[0] : null

      if (originalId) {
        const relatedItems = updatedItems.filter((item) =>
          item.id.startsWith(originalId),
        )

        const allPartsPaid = relatedItems.every((item) => item.is_paid)

        if (allPartsPaid) {
          // Atualiza o item original como pago
          return {
            items: updatedItems.map((item) =>
              item.id === originalId ? { ...item, is_paid: true } : item,
            ),
          }
        }
      }

      return { items: updatedItems }
    })
  },
}))
