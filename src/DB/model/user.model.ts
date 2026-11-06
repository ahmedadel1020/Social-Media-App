import mongoose, { HydratedDocument } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  StatusEnum,
} from "../../common/enum/user.enum";
import { Iuser } from "../../common/interface/user.interface";
import { hash } from "../../common/security/hash.security";
import { encryption } from "../../common/security/encryption.security";

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
    changeStatusAt: Date,
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
    status: {
      type: Number,
      enum: StatusEnum,
      default: StatusEnum.ACTIVE,
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

userschema.pre("validate", function () {
  console.log("pre validate");
  if (this.provider == ProviderEnum.GOOGLE && this.password) {
    throw new Error("invalid");
  }
});

userschema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }

  if (this.isModified("phone")) {
    this.phone = await encryption(this.phone as string);
  }
});

userschema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid != false) {
    this.setQuery({ ...query, status: { $ne: StatusEnum.ARCHIVE } });
  }
});

userschema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
  const query = this.getQuery();

  const update = this.getUpdate() as HUser;

  if ((update.status = StatusEnum.ACTIVE)) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ARCHIVE } });
  } else if ((update.status = StatusEnum.ARCHIVE)) {
    this.setQuery({ ...query, status: { $ne: StatusEnum.ARCHIVE } });
  }
  if (!update.status && query.paranoid != false) {
    this.setQuery({ ...query, status: { $ne: StatusEnum.ARCHIVE } });
  }

  this.setUpdate({
    ...update,
    ...(update.status ? { changeStatusAt: new Date() } : {}),
  });
});

userschema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
  const query = this.getFilter();

  if (!query.force) {
    this.setQuery({ ...query, status: { $eq: StatusEnum.ARCHIVE } });
  }
});

export const userModel =
  mongoose.models.user || mongoose.model<Iuser>("user", userschema);

export type HUser = HydratedDocument<Iuser>;
