export interface verifyCode {
  code: string;
  expireTime: Date;
}
export interface IUser {
  _id: string;
  name: string;
  phonenumber: string;
  password: string;
  salt: string;
  verify: boolean;
  verifyCode: verifyCode;
}

export interface IUserInputDTO {
  phonenumber: string;
  password: string;
  name: string;
}
