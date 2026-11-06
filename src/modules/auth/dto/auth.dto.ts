import { z } from "zod";
import {
  confirmEmail,
  login,
  resendConfirmEmail,
  signup,
} from "../auth.validation";
// export interface ISignupDto {
//   username: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
// }

export type SignupDto = z.infer<ReturnType<typeof signup>>;
export type LoginDto = z.infer<ReturnType<typeof login>>;
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmail>>;
export type resendConfirmEmailDto = z.infer<
  ReturnType<typeof resendConfirmEmail>
>;
