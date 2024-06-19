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

export type CreateUserDto = Omit<User, "id">;
