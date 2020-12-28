import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import SmsService from './sms';
import { IUser, IUserInputDTO, verifyCode } from '../interfaces/IUser';
import { randomBytes } from 'crypto';
import { Logger } from 'winston';

@Service()
export default class AuthService {
  constructor(
    @Inject('userModel') private userModel: Models.UserModel,
    private sms: SmsService,
    @Inject('logger') private logger: Logger,
  ) {}

  public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUser }> {
    try {
      const salt = randomBytes(32);
      this.logger.silly('Hashing password');
      const hashedPassword = await argon2.hash(userInputDTO.password, { salt });
      this.logger.silly('Creating user db record');
      const verifyCode: verifyCode = {
        code: '111111',
        expireTime: new Date(Date.now() + 5 * 60 * 1000),
      };
      const userRecord = await this.userModel.create({
        ...userInputDTO,
        salt: salt.toString('hex'),
        password: hashedPassword,
        verifyCode,
        verify: false,
      });

      if (!userRecord) {
        throw new Error('User cannot be created');
      }
      this.logger.silly('Sending code to phonenumber');
      await this.sms.SendVerifyCode(userRecord.phonenumber);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      Reflect.deleteProperty(user, 'verifyCode');

      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async Verify(phonenumber: string, code: string) {
    const userRecord = await this.userModel.findOne({ phonenumber });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    if (userRecord.verify) {
      throw new Error('User already verified');
    }

    if (userRecord.verifyCode.code !== code) {
      throw new Error('Code is not valid or expired');
    }
    await this.userModel.updateOne({ phonenumber: phonenumber }, { $set: { verify: true } });
  }

  public async ResendCode(phonenumber: string) {
    const userRecord = await this.userModel.findOne({ phonenumber });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    if (userRecord.verify) {
      throw new Error('User already verified');
    }

    await this.userModel.updateOne(
      { phonenumber: phonenumber },
      { $set: { 'verifyCode.expireTime': new Date(Date.now() + 5 * 60 * 1000) } },
    );
  }

  public async ResetPasswordLinkGenerator(phonenumber: string) {
    const userRecord = await this.userModel.findOne({ phonenumber });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    if (!userRecord.verify) {
      throw new Error('User not verified');
    }
    this.logger.silly('Generating JWT');
    // const token = this.generateTokenForResetPassword(userRecord);
    await this.userModel.updateOne({ phonenumber: phonenumber }, { $set: { 'verifyCode.code': '222222' } });
  }

  public async VerifyPasswordChange(phonenumber: string, code: string) {
    const userRecord = await this.userModel.findOne({ phonenumber, 'verifyCode.code': code });
    if (!userRecord) {
      throw new Error('User not found');
    }
    if (!userRecord.verify) {
      throw new Error('User not verified');
    }
    this.logger.silly('Generating JWT');
    return this.generateTokenForResetPassword(userRecord);
  }

  public async ChangePassword(password: string, jwtCode: string) {
    const decoded = jwt.verify(jwtCode, config.jwtSecret);
    const userRecord = await this.userModel.findOne({ _id: decoded._id });
    if (!userRecord) {
      throw new Error('User not registered');
    }
    if (!userRecord.verify) {
      throw new Error('User not verified');
    }
    const salt = randomBytes(32);
    this.logger.silly('Hashing password');
    const hashedPassword = await argon2.hash(password, { salt });
    this.logger.silly('Creating user db record');

    await this.userModel.updateOne(
      { _id: decoded._id },
      { $set: { salt: salt.toString('hex'), password: hashedPassword } },
    );
  }

  public async SignIn(phonenumber: string, password: string): Promise<{ user: IUser; token: string }> {
    const userRecord = await this.userModel.findOne({ phonenumber });
    if (!userRecord) {
      throw new Error('User not registered');
    }

    if (!userRecord.verify) {
      throw new Error('User not verified');
    }

    this.logger.silly('Checking password');
    const validPassword = await argon2.verify(userRecord.password, password);
    if (validPassword) {
      this.logger.silly('Password is valid!');
      this.logger.silly('Generating JWT');
      const token = this.generateToken(userRecord);

      const user = userRecord.toObject();
      Reflect.deleteProperty(user, 'password');
      Reflect.deleteProperty(user, 'salt');
      Reflect.deleteProperty(user, 'verifyCode');

      return { user, token };
    } else {
      throw new Error('Invalid Password');
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
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }

  private generateTokenForResetPassword(user) {
    const exp = new Date(Date.now() + 30 * 60 * 1000);

    this.logger.silly(`Sign JWT for userId: ${user._id}`);
    return jwt.sign(
      {
        _id: user._id, // We are gonna use this in the middleware 'isAuth'
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }
}
