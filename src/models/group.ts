import { IGroup } from '../interfaces/IGroup';
import mongoose from 'mongoose';

const insert = (str: string, index: number, value: string) => str.substr(0, index) + value + str.substr(index);

const Group = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      index: true,
    },

    key: {
      type: String,
      default: insert((+new Date()).toString(36), 4, '-'),
    },

    wallet: {
      type: Number,
      default: 0,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    creator: {
      type: String,
      required: true,
    },

    members: [
      {
        phonenumber: String,
        num: Number,
        balance: { type: Number, default: 0 },
      },
    ],

    items: [
      {
        name: String,
        count: Number,
        unit: Number,
        creator: String,
        status: { type: String, enum: ['number-of-heads', 'number-of-members'] },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IGroup & mongoose.Document>('Group', Group);
