
interface Member {
  num: string;
  phonenumber: string;
}

export interface IGroup {
  _id: string;
  name: string;
  image: string;
  key: string;
  wallet: number;
  disabled: boolean;
  creator: string;
  members: Member[];
}
