import mongoose, { HydratedDocument } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/user.enum";
import { Iuser } from "../../common/interface/user.interface";

const userschema = new mongoose.Schema<Iuser>(
  {
    firstName: {
      type: String,
      minlenght: 2,
      maclength: 25,
      required: true,
    },
    lastName: {
      type: String,
      minlenght: 2,
      maclength: 25,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function (): boolean {
        return this.provider == ProviderEnum.SYSTEM;
      },
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    confirm2fa: Date,
    image: String,
    coverImage: String,
    changeCredentialsTime: Date,
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

userschema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel =
  mongoose.models.user || mongoose.model<Iuser>("user", userschema);

export type HUser = HydratedDocument<Iuser>;
