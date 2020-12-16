import { IUser } from '../interfaces/IUser';
import { Status, UserRoles } from '../interfaces/enums';
import mongoose, { Schema } from 'mongoose';

const User = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    name: String,

    googleId: String,

    appleId: String,

    role: {
      type: String,
      enum: [UserRoles.User, UserRoles.Admin],
      default: UserRoles.User,
    },

    status: {
      type: String,
      enum: [Status.Free, Status.Premium, Status.Pending],
      default: Status.Free,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      autopopulate: true,
    },

    expireTime: {
      type: Number,
      select: true,
      default: 0,
    },

    planId: {
      type: String,
      select: true,
      default: '',
    },

    fcmToken: String,
  },
  { timestamps: true },
);

User.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IUser & mongoose.Document>('User', User);
