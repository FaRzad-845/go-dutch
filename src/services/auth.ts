import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import config from '../config';
import googleValidator from '../utils/google-validator';
import appleValidator from '../utils/apple-validator';
import { IUser, IUserAdmin, IUserAppleInputDTO, IUserGoogleInputDTO } from '../interfaces/IUser';
import { Logger } from 'winston';
import { Status } from '../interfaces/enums';

@Service()
export default class AuthService {
  constructor(@Inject('userModel') private userModel: Models.UserModel, @Inject('logger') private logger: Logger) {}

  public async Google(userInputDTO: IUserGoogleInputDTO): Promise<{ user: IUser; token: string }> {
    try {
      this.logger.silly('Validating incoming request');
      const { ok, data } = await googleValidator(userInputDTO);
      if (!ok) {
        throw new Error('User cannot be created');
      }
      // const data = { email: 'farzadshami845@gmail.com', name: 'FaRzad Shami', userId: '106175056830104532938' };
      const { email, name, userId } = data;

      let userRecord = await this.userModel.findOne({ email, googleId: userId });
      if (userRecord) {
        const token = this.generateToken(userRecord);
        return { token, user: userRecord.toObject() };
      }

      this.logger.silly('Creating user db record');
      userRecord = await this.userModel.create({
        email,
        name,
        googleId: userId,
        status: Status.Free,
      });
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      return { user: userRecord.toObject(), token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async Apple(userInputDTO: IUserAppleInputDTO): Promise<{ user: IUser; token: string }> {
    let email;
    try {
      const response = await appleValidator.accessToken(userInputDTO.serverAuthCode);
      this.logger.silly(`[INFO] response ${response}`);
      email = jwt.decode(response.id_token).email;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
    if (email && userInputDTO.fullName && userInputDTO.fullName !== ' ') {
      try {
        const user = await this.userModel.create({
          email,
          name: userInputDTO.fullName,
          status: Status.Free,
          appleId: userInputDTO.userId,
        });
        return { user, token: this.generateToken(user) };
      } catch (e) {
        this.logger.error(e);
        throw e;
      }
    }

    try {
      let userRecord = await this.userModel.findOne({ appleId: userInputDTO.userId });
      if (!userRecord) {
        userRecord = await this.userModel.create({
          email,
          name: userInputDTO.fullName,
          status: Status.Free,
          appleId: userInputDTO.userId,
        });
      }
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);
      const user = userRecord.toObject();
      return { user, token };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async Admin(userInputDTO: IUserAdmin): Promise<{ user: IUser; token: string }> {
    try {
      const userRecord = await this.userModel.findOne({ name: userInputDTO.name, password: userInputDTO.password });
      if (!userRecord) {
        throw new Error('User cannot be find');
      }
      const token = this.generateToken(userRecord);
      return { token, user: userRecord.toObject() };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        role: user.role,
        email: user.email,
      },
      config.jwtSecret,
      { algorithm: config.jwtAlgorithm },
    );
  }
}
