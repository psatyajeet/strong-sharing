import axios from 'axios';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export async function getWorkouts() {
  try {
    const headers = {
      "X-Parse-Session-Token": process.env.STRONG_SESSION_TOKEN,
      "X-Parse-Application-Id": process.env.STRONG_APPLICATION_ID,
    };

    const response = await axios({
      method: "post",
      url: `https://strong4-server.herokuapp.com/parse/classes/ParseWorkout`,
      headers,
      data: {
        _method: "GET",
        include:
          "parseOriginRoutine,parseOriginRoutine.parseFolder,parseRoutine,parseRoutine.parseFolder,parseSetGroups.parseExercise",
        limit: "1000",
        where: {
          user: {
            __type: "Pointer",
            className: "_User",
            objectId: process.env.STRONG_USER_ID,
          },
        },
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
