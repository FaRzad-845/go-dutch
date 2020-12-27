import { Document, Model } from 'mongoose';
import { IGroup } from '../../interfaces/IGroup';
import { IUser } from '../../interfaces/IUser';
declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
      files: any;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type GroupModel = Model<IGroup & Document>;
  }
}
