import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { Logger } from 'winston';
import { Status } from '../../interfaces/enums';

/**
 * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  const Logger: Logger = Container.get('logger');
  try {
    const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
    const userRecord = await UserModel.findById(req.token._id);
    if (!userRecord) {
      return res.sendStatus(401);
    }
    const status = userRecord.status === Status.Free ? Status.Free : Status.Premium;
    const currentUser = userRecord.toObject();
    Reflect.deleteProperty(currentUser, 'createdAt');
    Reflect.deleteProperty(currentUser, 'updatedAt');
    Reflect.deleteProperty(currentUser, '__v');
    Reflect.deleteProperty(currentUser, 'googleId');
    Reflect.deleteProperty(currentUser, 'appleId');
    Reflect.deleteProperty(currentUser, 'status');

    req.currentUser = { ...currentUser, status };
    req.currentStatus = userRecord.status;
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
