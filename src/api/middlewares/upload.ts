import { Container } from 'typedi';
import { Logger } from 'winston';
import multer from '../../utils/multerUpload';

const upload = async (req, res, next) => {
  const Logger: Logger = Container.get('logger');
  try {
    multer(req, res, err => {
      if (err) throw err;
      next();
    });
  } catch (e) {
    Logger.error('🔥 Error fetching image %o', e);
    return next(e);
  }
};

export default upload;
