import { Router, Request, Response, NextFunction } from 'express';
import middlewares from '../middlewares';
import Grid from 'gridfs-stream';
import { connection, mongo } from 'mongoose';
import { Logger } from 'winston';
import { Container } from 'typedi';

const route = Router();

let gfs;
connection.once('open', () => {
  gfs = Grid(connection.db, mongo);
  gfs.collection('uploads');
});

export default (app: Router) => {
  app.use('/image', route);

  route.get('/:filename', middlewares.isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling creating group endpoint with body: %o', req.body);
    try {
      const file = await gfs.files.findOne({ filename: req.params.filename });
      const filetypes = /jpeg|jpg|png|svg|svg\+xml/;
      if (!file || file.length === 0 || !filetypes.test(file.contentType)) throw 'No file Exists';
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
