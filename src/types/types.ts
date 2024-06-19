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
  userId: string;
  order: number;
  tasks: Task[];
};

export type Task = {
  id: string;
  description: string;
  boardId: string;
  userId: string;
  order: number;
};

export type CreateUserDto = Omit<User, "id">;

export type UpdateBoardDto = Omit<Board, "userId" | "order" | "tasks">;
