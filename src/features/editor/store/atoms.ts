import { atom } from "jotai";
import { ReactFlowInstance } from "@xyflow/react";

export const editorAtom = atom<ReactFlowInstance | null>(null);