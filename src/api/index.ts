import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import image from './routes/image';
import agendash from './routes/agendash';
import group from './routes/groups';


// guaranteed to get dependencies
export default () => {
  const app = Router();
  // users section
  auth(app);
  user(app);
  group(app);
  image(app);

  // admin section
  agendash(app);

  return app;
};
