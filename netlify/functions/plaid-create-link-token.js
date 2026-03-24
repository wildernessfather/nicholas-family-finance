exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }
  const CLIENT_ID = process.env.PLAID_CLIENT_ID;
  const SECRET    = process.env.PLAID_SECRET;
  const ENV       = process.env.PLAID_ENV || 'sandbox';
  try {
    const res = await fetch(`https://${ENV}.plaid.com/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID, secret: SECRET,
        client_name: 'Nicholas Family Finance',
        user: { client_user_id: 'nicholas-family' },
        products: ['transactions'], country_codes: ['US'], language: 'en'
      })
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};
