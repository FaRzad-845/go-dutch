import Agenda from 'agenda';
import config from '../config';

export default ({ mongoConnection }) => {
  return new Agenda({
    mongo: mongoConnection,
    db: { collection: config.agenda.dbCollection || 'agenda' },
    processEvery: config.agenda.pooltime,
    maxConcurrency: config.agenda.concurrency,
    defaultLockLifetime: 10000,
  });
};
