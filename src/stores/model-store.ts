import { MODELS } from "@/constants";
import { Model } from "@/types";
import { create } from "zustand";

interface ModelStore {
  model: Model
  setModel: (model: Model) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  model: MODELS[0],
  setModel: (model) => set({ model })
}))
