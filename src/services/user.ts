import { Service, Inject } from 'typedi';
import { Logger } from 'winston';

@Service()
export default class UsersService {
  constructor(@Inject('userModel') private userModel: Models.UserModel, @Inject('logger') private logger: Logger) {}
}
