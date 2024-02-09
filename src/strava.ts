import axios from "axios";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

async function getCredentials() {
  const refresh_token = process.env.STRAVA_REFRESH_TOKEN;

  const response = await axios({
    method: "post",
    url: "https://www.strava.com/api/v3/oauth/token",
    data: {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token,
    },
  });

  const {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    expires_at: newExpiresAt,
  } = response.data;

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
      method: "post",
      url: "https://www.strava.com/api/v3/activities",
      headers: { Authorization: `Bearer ${accessToken}` },
      data: activity,
    });

    return result;
  } catch (err) {
    throw err;
  }
}
