exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }
  const CLIENT_ID = process.env.PLAID_CLIENT_ID;
  const SECRET    = process.env.PLAID_SECRET;
  const ENV       = process.env.PLAID_ENV || 'sandbox';
  try {
    const { public_token } = JSON.parse(event.body);
    const res = await fetch(`https://${ENV}.plaid.com/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, secret: SECRET, public_token })
    });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ access_token: data.access_token, item_id: data.item_id }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};
