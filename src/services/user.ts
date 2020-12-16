import { Service, Inject } from 'typedi';
import { IUser } from '../interfaces/IUser';
import { Logger } from 'winston';
import { Status } from '../interfaces/enums';

@Service()
export default class UsersService {
  constructor(@Inject('userModel') private userModel: Models.UserModel, @Inject('logger') private logger: Logger) {}

  public async findExpiredUsers(): Promise<IUser[]> {
    try {
      this.logger.silly('Find Expired users');
      return await this.userModel.find({ createdAt: { $lt: new Date() }, status: Status.Premium });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async findPremiumUsers(): Promise<IUser[]> {
    try {
      this.logger.silly('Find new premium users');
      return await this.userModel.find({ status: Status.Pending });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async update(id: any, data: any): Promise<IUser[]> {
    try {
      this.logger.silly('Find new premium users');
      return await this.userModel.updateOne({ _id: id }, { ...data });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
