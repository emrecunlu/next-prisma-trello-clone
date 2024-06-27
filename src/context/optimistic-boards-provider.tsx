"use client";

import { Board } from "@/types/types";
import React, {
  createContext,
  startTransition,
  useContext,
  useOptimistic,
} from "react";

type Props = {
  children: React.ReactNode;
  initialState: Board[];
};

type OptimisticBoardsContextType = {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
};

const OptimisticBoardContext =
  createContext<OptimisticBoardsContextType | null>(null);

export const OptimisticBoardsProvider = ({ children, initialState }: Props) => {
  const [optimisticBoards, setOptimisticBoards] =
    useOptimistic<Board[]>(initialState);

  const update = (boards: Board[]) => {
    startTransition(() => {
      setOptimisticBoards(boards);
    });
  };

  return (
    <OptimisticBoardContext.Provider
      value={{
        boards: optimisticBoards,
        setBoards: update,
      }}
    >
      {children}
    </OptimisticBoardContext.Provider>
  );
};

export const useOptimisticBoards = () => {
  const context = useContext(OptimisticBoardContext);

  if (!context) throw new Error("Optimistic Board Context Error!");

  return context;
};
