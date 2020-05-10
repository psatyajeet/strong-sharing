import axios from 'axios';
import redis from 'redis';
import { promisify } from 'util';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const redisClient = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

async function getCredentials() {
  let refresh_token = await getAsync('refresh_token');

  const response = await axios({
    method: 'post',
    url: 'https://www.strava.com/api/v3/oauth/token',
    data: {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token,
    },
  });

  const {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    expires_at: newExpiresAt,
  } = response.data;

  await setAsync('access_token', newAccessToken);
  await setAsync('refresh_token', newRefreshToken);
  await setAsync('expires_at', newExpiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt: newExpiresAt,
  };
}

export async function uploadActivity(activity: {
  name: string;
  type: string;
  start_date_local: string;
  elapsed_time: number;
  description: string;
}) {
  try {
    const { accessToken } = await getCredentials();
    const result = await axios({
      method: 'post',
      url: 'https://www.strava.com/api/v3/activities',
      headers: { Authorization: `Bearer ${accessToken}` },
      data: activity,
    });

    return result;
  } catch (err) {
    throw err;
  }
}
