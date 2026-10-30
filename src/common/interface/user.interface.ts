import { GenderEnum, ProviderEnum, RoleEnum } from "../enum/user.enum";

export interface Iuser {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  DOB?: string;
  confirmEmail?: string;
  confirm2fa?: string;
  image?: string;
  coverImage?: string[];
  changeCredentialsTime?: string;
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProviderEnum;
  createdAt: string;
  updatedAt: string;
}
