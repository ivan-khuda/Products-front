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
  console.log('machineId', machineId);
  console.log('variationId', variationId);

  if (!machineId && !variationId) return Response.json({}, { status: 422 });

  try {
    const response = await fetch(`${API_URL}/machines/search`, {
      method: 'POST',
      // @ts-ignore
      headers: {
        'Content-Type': 'application/json',
        'X-SpecCheck-ApiKey': API_KEY,
        'X-SpecCheck-Timestamp': timeStamp,
        'X-SpecCheck-AccessToken': accessToken,
      },
      // mode: 'no-cors',
      body: JSON.stringify({
        machineIds: [machineId],
        variationIds: [variationId],
      }),
    });

    return response;
  } catch (e) {
    console.log('e', e);
  }

  return Response.json({
    success: true,
    test: 'specCheck222',
  });
}
