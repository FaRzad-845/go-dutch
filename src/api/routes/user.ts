import { Router, Request, Response } from 'express';
import middlewares from '../middlewares';
const route = Router();

export default (app: Router) => {
  app.use('/users', route);

  /**
   * @swagger
   * /api/users/me:
   *   get:
   *     tags:
   *       - Users
   *     description: Get user by token - Who am i
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: user info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/User'
   */
  route.get('/me', middlewares.isAuth, middlewares.attachCurrentUser, (req: Request, res: Response) => {
    return res.json({ user: req.currentUser }).status(200);
  });
};
