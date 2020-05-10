import { CronJob } from 'cron';
import { pullNewWorkoutsAndUpload } from './pullWorkoutsAndUpload';

console.log('Initializing jobs...');

new CronJob(
  '0 0 * * * *',
  pullNewWorkoutsAndUpload,
  '',
  true,
  'America/New_York'
);
