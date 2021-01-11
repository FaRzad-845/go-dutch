interface Member {
  num: string;
  phonenumber: string;
}
export interface IGroup {
  _id: string;
  name: string;
  image: string;
  creator: string;
  members: Member[];
}
