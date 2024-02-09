import dotenv from "dotenv";
import log from "./logger";
import { pullNewWorkoutsAndUpload } from "./pullWorkoutsAndUpload";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

enum Action {
  PULL_NEW_WORKOUTS = "pullNewWorkouts",
}

export async function handler(event: any, context: any) {
  log.info(event);
  const { action, coin, amount } = event;

  if (!action) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing action",
      }),
    };
  }

  switch (action) {
    case Action.PULL_NEW_WORKOUTS:
      await pullNewWorkoutsAndUpload();
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Invalid action: ${action}`,
        }),
      };
  }

  return "OK!";
}
