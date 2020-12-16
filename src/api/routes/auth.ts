import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService from '../../services/auth';
import { IUserInputDTO } from '../../interfaces/IUser';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     tags:
   *       - Auth
   *     description: Sign Up a new user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user
   *         description: user object
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/UserInputDTO'
   *     responses:
   *       201:
   *         description: Successfully created
   */
  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        phonenumber: Joi.string().required(),
        password: Joi.string().required(),
        name: Joi.string().allow(null, ''),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        return res.status(201).json({ user });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/verify:
   *   post:
   *     tags:
   *       - Auth
   *     description: verify the code send to user phonenumber
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: details
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/VerifyUser'
   *     responses:
   *       200:
   *         description: Successfully verified
   */
  route.post(
    '/verify',
    celebrate({
      body: Joi.object({
        phonenumber: Joi.string().required(),
        code: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const { phonenumber, code } = req.body;
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.Verify(phonenumber, code);
        return res.sendStatus(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/resend-code:
   *   post:
   *     tags:
   *       - Auth
   *     description: resend code to user's phonenumber
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phonenumber:
   *                 type: string
   *                 example: 09023550300
   *     responses:
   *       200:
   *         description: Successfully send code
   */
  route.post(
    '/resend-code',
    celebrate({
      body: Joi.object({
        phonenumber: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling resend-code endpoint with phonenumber: %o', req.body.phonenumber);
      try {
        const { phonenumber } = req.body;
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.ResendCode(phonenumber);
        return res.sendStatus(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/signin:
   *   post:
   *     tags:
   *       - Auth
   *     description: sign in user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user
   *         description: user object
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/LoginUser'
   *     responses:
   *       200:
   *         description: Successfully login -> returns user and token
   */
  route.post(
    '/signin',
    celebrate({
      body: Joi.object({
        phonenumber: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);
      try {
        const { phonenumber, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignIn(phonenumber, password);
        return res.status(200).json({ user, token });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     tags:
   *       - Auth
   *     description: reset-password request to send link to mobile phone
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phonenumber:
   *                 type: string
   *                 example: 09023550300
   *     responses:
   *       200:
   *         description: Successfully send link
   */
  route.post(
    '/reset-password',
    celebrate({
      body: Joi.object({
        phonenumber: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Reset-Password generate link endpoint with body: %o', req.body);
      try {
        const { phonenumber } = req.body;
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.ResetPasswordLinkGenerator(phonenumber);
        return res.sendStatus(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/reset-password/{token}:
   *   put:
   *     tags:
   *       - Auth
   *     description: reset-password change password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token in the link
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *           example: sdfjnkljsdjfkldsjfkldsjf
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               password:
   *                 type: string
   *                 example: ye password khafan dg
   *     responses:
   *       200:
   *         description: Successfully change password
   */
  route.put(
    '/reset-password/:jwtCode',
    celebrate({
      body: Joi.object({
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Reset-Password change endpoint');
      try {
        const { password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.ChangePassword(password, req.params.jwtCode);
        return res.sendStatus(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags:
   *       - Auth
   *     description: logout
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Successfully logout
   */
  route.post('/logout', middlewares.isAuth, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling LogOut endpoint');
    try {
      return res.sendStatus(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
