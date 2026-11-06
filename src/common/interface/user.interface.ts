import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  StatusEnum,
} from "../enum/user.enum";

export interface Iuser {
  status: StatusEnum;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  DOB?: Date;
  confirmEmail?: Date;
  confirm2fa?: string;
  image?: string;
  coverImage?: string[];
  changeCredentialsTime?: Date;
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProviderEnum;
  createdAt: Date;
  updatedAt: Date;
  changeStatusAt?: Date;
}
