"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../../common/enum/user.enum");
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
exports.userModel = mongoose_1.default.models.user || mongoose_1.default.model("user", userschema);
