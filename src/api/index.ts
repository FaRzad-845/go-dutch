import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import agendash from './routes/agendash';
import admin from './routes/admin';
import servers from './routes/servers';
import conf from './routes/conf';
import products from './routes/products';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  // users section
  auth(app);
  user(app);
  conf(app);
  servers(app);
  agendash(app);
  products(app);

  // admin section
  admin(app);

  return app;
};
