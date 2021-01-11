import { Service, Inject } from 'typedi';
import { Logger } from 'winston';

const calculationOfCreditAndDebt = function (phonenumber, items, members) {
  const allMembersCount = members.map(member => member.num).reduce((prev, curr) => prev + curr, 0);
  const user = members.filter(member => member.phonenumber == phonenumber)[0];
  const userFamilyCount = user.num;
  const balance = user.balance || 0;
  const credit = items
    .filter(item => item.creator == phonenumber)
    .map(
      item =>
        item.unit * item.count -
        (item.status == 'number-of-heads'
          ? (item.unit * item.count) / members.length
          : ((item.unit * item.count) / allMembersCount) * userFamilyCount),
    )
    .reduce((prev, curr) => prev + curr, 0);

  const debt = items
    .filter(item => item.creator != phonenumber)
    .map(
      item =>
        item.unit * item.count -
        (item.status == 'number-of-heads'
          ? ((item.unit * item.count) / members.length) * members.length - 1
          : ((item.unit * item.count) / allMembersCount) * (allMembersCount - userFamilyCount)),
    )
    .reduce((prev, curr) => prev + curr, 0);

  return { credit, debt, balance: credit + balance - debt };
};


const groupByName = items => {
  return items.reduce((groups, item) => {
    const group = groups[item.group] || [];
    group.push(item);
    groups[item.group] = group;
    return groups;
  }, {});
};

@Service()
export default class GroupService {
  constructor(
    @Inject('groupModel') private groupModel: Models.GroupModel,
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('logger') private logger: Logger,
  ) {}

  public async Create(groupInputDTO, files, creator) {
    try {
      const members = JSON.parse(groupInputDTO.members);
      const groupRecord = await this.groupModel.create({
        name: groupInputDTO.name,
        creator,
        members,
        image: files[0].filename,
      });
      const phonenumbersList = members.map(member => member.phonenumber);
      const usersRecord = await this.userModel.find({ phonenumber: { $in: phonenumbersList } });
      const databasePhonenumbersList = usersRecord.map(u => u.phonenumber);

      const intersectionPhonenumbers = phonenumbersList.filter(p => databasePhonenumbersList.includes(p));
      const differencePhonenumbers = phonenumbersList.filter(p => !databasePhonenumbersList.includes(p));

      await this.userModel.updateMany(
        { phonenumber: { $in: intersectionPhonenumbers } },
        { $addToSet: { groups: groupRecord._id } },
      );

      // send sms to differencePhonenumbers
      await console.log({ differencePhonenumbers, intersectionPhonenumbers });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async AddItem(groupId, inputItemsDTO, creator) {
    try {
      const inputItems = inputItemsDTO.map(item => {
        return { ...item, creator };
      });
      await this.groupModel.updateOne(
        { _id: groupId, 'members.phonenumber': creator },
        { $push: { items: { $each: inputItems } } },
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async GetAll(user) {
    try {
      return user.groups.map(({ key, __v, ...data }) => {
        return {
          ...data,
          ...calculationOfCreditAndDebt(user.phonenumber, data.items, data.members),
          items: groupByName(data.items),
        };
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async GetOne(user, groupId) {
    try {
      let groups = user.groups.filter(group => group._id == groupId);
      groups = groups.map(({ key, __v, ...data }) => {
        return {
          ...data,
          ...calculationOfCreditAndDebt(user.phonenumber, data.items, data.members),
          items: groupByName(data.items),
        };
      });
      return groups.length == 1 ? groups[0] : {};
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async JoinGroup(key, phonenumber) {
    try {
      const groupRecord = await this.groupModel.findOne({
        key,
        'members.phonenumber': phonenumber,
      });
      if (!groupRecord) throw 'you cannot join this group';
      await this.userModel.updateOne({ phonenumber }, { $addToSet: { groups: groupRecord._id } });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async AddBalance(groupId, phonenumber, amount) {
    try {
      await this.groupModel.updateOne(
        { _id: groupId, 'members.phonenumber': phonenumber },
        { $inc: { 'members.$.balance': amount } },
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async ReduceBalance(groupId, phonenumber, amount) {
    try {
      await this.groupModel.updateOne(
        { _id: groupId, 'members.phonenumber': phonenumber },
        { $inc: { 'members.$.balance': -amount } },
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
