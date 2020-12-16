import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import agendash from './routes/agendash';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  // users section
  auth(app);
  user(app);

  // admin section
  agendash(app);

  return app;
};
