// Editor state — holds the EditDocument.
import { create } from "zustand";
import type { EditDocument, Layer } from "@edit-schema";

interface EditorState {
  document: EditDocument | null;
  selectedLayerId: string | null;
  load: (doc: EditDocument) => void;
  select: (id: string | null) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
}

export const useEditor = create<EditorState>((set) => ({
  document: null,
  selectedLayerId: null,
  load: (doc) => set({ document: doc }),
  select: (id) => set({ selectedLayerId: id }),
  updateLayer: (id, patch) =>
    set((state) => {
      if (!state.document) return state;
      return {
        document: {
          ...state.document,
          layers: state.document.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        },
      };
    }),
}));
