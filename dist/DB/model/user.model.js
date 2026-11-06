"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../../common/enum/user.enum");
const hash_security_1 = require("../../common/security/hash.security");
const encryption_security_1 = require("../../common/security/encryption.security");
const userschema = new mongoose_1.default.Schema({
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
        required: function () {
            return this.provider == user_enum_1.ProviderEnum.SYSTEM;
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
        enum: user_enum_1.GenderEnum,
        default: user_enum_1.GenderEnum.MALE,
    },
    role: {
        type: Number,
        enum: user_enum_1.RoleEnum,
        default: user_enum_1.RoleEnum.USER,
    },
    provider: {
        type: Number,
        enum: user_enum_1.ProviderEnum,
        default: user_enum_1.ProviderEnum.SYSTEM,
    },
    status: {
        type: Number,
        enum: user_enum_1.StatusEnum,
        default: user_enum_1.StatusEnum.ACTIVE,
    },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true,
});
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
    if (this.provider == user_enum_1.ProviderEnum.GOOGLE && this.password) {
        throw new Error("invalid");
    }
});
userschema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await (0, hash_security_1.hash)(this.password);
    }
    if (this.isModified("phone")) {
        this.phone = await (0, encryption_security_1.encryption)(this.phone);
    }
});
userschema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.StatusEnum.ARCHIVE } });
    }
});
userschema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
    const query = this.getQuery();
    const update = this.getUpdate();
    if ((update.status = user_enum_1.StatusEnum.ACTIVE)) {
        this.setQuery({ ...query, status: { $eq: user_enum_1.StatusEnum.ARCHIVE } });
    }
    else if ((update.status = user_enum_1.StatusEnum.ARCHIVE)) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.StatusEnum.ARCHIVE } });
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_1.StatusEnum.ARCHIVE } });
    }
    this.setUpdate({
        ...update,
        ...(update.status ? { changeStatusAt: new Date() } : {}),
    });
});
userschema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: user_enum_1.StatusEnum.ARCHIVE } });
    }
});
exports.userModel = mongoose_1.default.models.user || mongoose_1.default.model("user", userschema);
