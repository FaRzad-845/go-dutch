import { Status } from './enums';
export interface IUser {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  appleId?: string;
  status?: string;
  planId?: string;
  expireTime?: number;
}

export interface IUserGoogleInputDTO {
  token: string;
}

export interface IUserAppleInputDTO {
  userId: string;
  serverAuthCode: string;
  fullName: string;
}

export interface IUserAdmin {
  name: string;
  password: string;
}
