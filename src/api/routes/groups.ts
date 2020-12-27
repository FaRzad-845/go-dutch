import { celebrate, Joi } from 'celebrate';
import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import GroupService from '../../services/group';
import middlewares from '../middlewares';
const route = Router();

export default (app: Router) => {
  app.use('/groups', route);

  route.get(
    '/',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling creating group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        const groups = await groupServiceInstance.GetAll(req.currentUser);
        return res.status(200).json({ groups });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get(
    '/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling creating group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        const group = await groupServiceInstance.GetOne(req.currentUser, req.params.id);
        return res.status(200).json(group);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    middlewares.upload,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling creating group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        await groupServiceInstance.Create(req.body, req.files, req.currentUser.phonenumber);
        return res.status(201).json();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/:id/add-item',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        count: Joi.number().required(),
        unit: Joi.number().required(),
        status: Joi.string().allow('number-of-heads', 'number-of-members'),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling creating group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        await groupServiceInstance.AddItem(req.params.id, req.body, req.currentUser.phonenumber);
        return res.status(201).json();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/:id/join',
    celebrate({
      body: Joi.object({
        code: Joi.string().required(),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling creating group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        await groupServiceInstance.JoinGroup(req.body.code, req.currentUser.phonenumber);
        return res.status(200).json();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
