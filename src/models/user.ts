import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';
require('./group');

const User = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    phonenumber: {
      type: String,
      unique: true,
      index: true,
    },

    password: String,

    salt: String,

    role: {
      type: String,
      default: 'user',
    },

    verify: {
      type: Boolean,
      default: false,
    },

    verifyCode: {
      code: { type: String, index: true },
      expireTime: Date,
    },

    groups: [{ type: mongoose.Types.ObjectId, ref: 'Group', autopopulate: true }],
  },
  { timestamps: true },
);

User.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IUser & mongoose.Document>('User', User);
