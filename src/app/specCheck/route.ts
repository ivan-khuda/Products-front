import axios from 'axios';
import cryptoJs from 'crypto-js';
import { NextRequest } from 'next/server';

const API_KEY = 'API-6HoM9mgH8VZo-Ggr3l82-Fo7BmRz';
const SECRET = '7Wg97mRE0Vow';
const API_URL = 'https://api.speccheck.com/v1';

function unixTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function calculateAccessToken(
  apiKey: string,
  secret: string,
  timestamp: number
) {
  return cryptoJs.HmacSHA256(`${secret}${timestamp}`, apiKey).toString();
}

// SpecCheck documentation
// https://docs.speccheck.com/data-v8/models/machines/search-criteria/#common
export async function GET(request: NextRequest) {
  const timeStamp = unixTimestamp();
  const accessToken = calculateAccessToken(API_KEY, SECRET, timeStamp);
  const searchParams = request.nextUrl.searchParams;
  const machineId = searchParams.get('machineId');
  const variationId = searchParams.get('variationId');

  if (!machineId && !variationId) return Response.json({}, { status: 422 });

  try {
    const response = await axios.post(
      `${API_URL}/machines/search`,
      {
        machineIds: [parseInt(machineId!)],
        variationIds: [parseInt(variationId!)],
        level: 'Attributes',
      },
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SpecCheck-ApiKey': API_KEY,
          'X-SpecCheck-Timestamp': timeStamp,
          'X-SpecCheck-AccessToken': accessToken,
        },
      }
    );

    return Response.json({
      success: true,
      data: response.data.results,
    });
  } catch (e) {
    console.log('e', e);
  }

  return Response.json({
    success: false,
  });
}
