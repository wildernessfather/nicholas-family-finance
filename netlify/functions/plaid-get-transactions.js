exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  const CLIENT_ID = process.env.PLAID_CLIENT_ID;
  const SECRET = process.env.PLAID_SECRET;
  const ENV = process.env.PLAID_ENV || 'sandbox';

  try {
    const { access_token } = JSON.parse(event.body);
    const now = new Date();
    // Pull 90 days to get 3 full months for averaging
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];

    const res = await fetch(`https://${ENV}.plaid.com/transactions/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        secret: SECRET,
        access_token,
        start_date: start,
        end_date: end,
        options: { count: 500, offset: 0 }
      })
    });

    const data = await res.json();

    // Also fetch accounts for balance data
    const acctRes = await fetch(`https://${ENV}.plaid.com/accounts/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, secret: SECRET, access_token })
    });
    const acctData = await acctRes.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        transactions: data.transactions,
        accounts: acctData.accounts || [],
        total_transactions: data.total_transactions
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};