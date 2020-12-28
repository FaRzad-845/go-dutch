import { celebrate, Joi } from 'celebrate';
import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import GroupService from '../../services/group';
import middlewares from '../middlewares';
const route = Router();

export default (app: Router) => {
  app.use('/groups', route);

  /**
   * @swagger
   * /api/groups:
   *   get:
   *     tags:
   *       - Groups
   *     security:
   *       - bearerAuth: []
   *     description: get all the groups
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Successful
   */
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

  /**
   * @swagger
   * /api/groups/{id}:
   *   get:
   *     tags:
   *       - Groups
   *     security:
   *       - bearerAuth: []
   *     description: get single group
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Successful
   */
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

  /**
   * @swagger
   * /api/groups:
   *   post:
   *     tags:
   *       - Groups
   *     description: create new group
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: farzad
   *               image:
   *                 type: string
   *                 format: binary
   *               members:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     phonenumber:
   *                       type: string
   *                       example: 09022261378
   *                     num:
   *                       type: integer
   *                       example: 5
   *         encoding:
   *           image:
   *             contentType: image/png, image/jpeg
   *     responses:
   *       201:
   *         description: Successful
   */
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

  /**
   * @swagger
   * /api/groups/{id}/add-item:
   *   post:
   *     tags:
   *       - Groups
   *     description: add new item
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: item-1
   *               count:
   *                 type: integer
   *                 example: 3
   *               unit:
   *                 type: integer
   *                 example: 3500
   *               status:
   *                 type: string
   *                 enum: ['number-of-heads', 'number-of-members']
   *     responses:
   *       201:
   *         description: Successful
   */
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

  /**
   * @swagger
   * /api/groups/{id}/join:
   *   post:
   *     tags:
   *       - Groups
   *     description: join to group
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *                 example: xvfg-ere2
   *     responses:
   *       200:
   *         description: Successful
   */
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

  /**
   * @swagger
   * /api/groups/{id}/add-balance:
   *   post:
   *     tags:
   *       - Groups
   *     description: add balance to user in group
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: integer
   *                 example: 1300
   *     responses:
   *       200:
   *         description: Successful
   */
  route.post(
    '/:id/add-balance',
    celebrate({
      body: Joi.object({
        amount: Joi.number().required(),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling add balance to group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        await groupServiceInstance.AddBalance(req.params.id, req.currentUser.phonenumber, req.body.amount);
        return res.status(200).json();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/groups/{id}/reduce-balance:
   *   post:
   *     tags:
   *       - Groups
   *     description: reduce balance to user in group
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: integer
   *                 example: 1500
   *     responses:
   *       200:
   *         description: Successful
   */
  route.post(
    '/:id/reduce-balance',
    celebrate({
      body: Joi.object({
        amount: Joi.number().required(),
      }),
    }),
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling add balance to group endpoint with body: %o', req.body);
      try {
        const groupServiceInstance = Container.get(GroupService);
        await groupServiceInstance.ReduceBalance(req.params.id, req.currentUser.phonenumber, req.body.amount);
        return res.status(200).json();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
