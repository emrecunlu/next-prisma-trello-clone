export type FormVisibility = "hidden" | "visible";

export type ActionResult<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  provider: string;
  photoUrl: string | null;
};

export type Board = {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
};

export type Task = {
  id: string;
  description: string;
  order: number;
};

export type CreateUserDto = Omit<User, "id">;

export type ReoderBoardDto = { source: number; destination: number };
export type UpdateBoardDto = Omit<Board, "order" | "tasks">;

export type ReorderTaskDto = Omit<Task, "description"> & {
  boardId: string;
};
export type UpdateTaskDto = Omit<Task, "order">;
export type CreateTaskDto = Omit<Task, "id" | "order"> & {
  boardId: string;
};
