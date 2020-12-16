import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { IUserAdmin, IUserAppleInputDTO, IUserGoogleInputDTO } from '../../interfaces/IUser';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/google',
    celebrate({
      body: Joi.object({
        token: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up with google endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.Google(req.body as IUserGoogleInputDTO);
        return res.status(200).json({ user, token });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/apple',
    celebrate({
      body: Joi.object({
        serverAuthCode: Joi.string().required(),
        userId: Joi.string().required(),
        email: Joi.string().allow(null, ''),
        fullName: Joi.string().allow(null, ''),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up with Apple endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.Apple(req.body as IUserAppleInputDTO);
        return res.status(200).json({ user, token });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/admin',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up with Admin endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.Admin(req.body as IUserAdmin);
        return res.status(200).json({ user, token });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
