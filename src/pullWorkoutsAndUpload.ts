import dotenv from 'dotenv';
import _ from 'lodash';
import moment from 'moment-timezone';
import { uploadActivity } from './strava';
import { getWorkouts } from './strong';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const CHECK_FREQUENCY_HOURS = parseInt(process.env.CHECK_FREQUENCY_HOURS || '');
const LBS_IN_KG = 2.20462;

async function parseWorkoutsAsStravaActivities() {
  const { results: workouts } = await getWorkouts();

  const stravaActivities: any[] = [];
  for (const workout of workouts) {
    const {
      startDate,
      completionDate,
      name,
      uniqueId,
      parseSetGroups,
    } = workout;

    if (completionDate) {
      const startTime = moment.tz(startDate.iso, 'America/Los_Angeles');
      const hoursAgo = moment().diff(startTime, 'hours');
      if (hoursAgo <= CHECK_FREQUENCY_HOURS) {
        const endTime = moment.tz(completionDate.iso, 'America/Los_Angeles');

        let description = '';
        for (const {
          parseSetsDictionary: sets,
          parseExercise: exercise,
        } of parseSetGroups) {
          const { name: exerciseName } = exercise;

          description += `${exerciseName}\n`;
          for (const { reps, kilograms, expectedReps, isChecked } of sets) {
            if (isChecked) {
              description += `${reps} reps: ${_.round(
                kilograms * LBS_IN_KG
              )} lbs\n`;
            }
          }
          description += '\n';
        }

        description += '\nEntered from Strong app';

        const newStravaActivity = {
          name,
          type: 'Workout',
          start_date_local: startTime.toISOString(true),
          elapsed_time: endTime.diff(startTime, 'seconds'),
          description,
        };

        stravaActivities.push(newStravaActivity);
      }
    }
  }

  return stravaActivities;
}

export async function pullNewWorkoutsAndUpload() {
  console.log('Pulling new workouts...');
  const parsedStravaWorkouts = await parseWorkoutsAsStravaActivities();
  console.log(`Found ${parsedStravaWorkouts.length} new workouts...`);
  for (const workout of parsedStravaWorkouts) {
    const result = await uploadActivity(workout);
  }
  console.log(`Uploaded ${parsedStravaWorkouts.length} new workouts...`);
  return true;
}
