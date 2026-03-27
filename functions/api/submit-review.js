/**
Submit a user review to Airtable
Netlify Serverless Function
*/
exports.handler = async function (event, context) {
    const { productId, rating, review } = JSON.parse(event.body);

    // Validate inputs
    if (!productId || !rating || !review) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }

    // Get Airtable API key from environment
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Products';

    // Find record by ID
    const record = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=AND({ID} = '${productId}')`, {
        headers: { Authorization: `Bearer ${apiKey}` }
    }).then(r => r.json());

    if (!record.records.length) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Product not found' })
        };
    }

    const existingReviews = record.records[0].fields.Reviews || [];
    const newReview = { rating, review, reviewer: 'User', date: new Date().toISOString() };
    existingReviews.push(newReview);

    // Update record
    const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.records[0].id}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                Reviews: existingReviews,
                'Last Reviewed': new Date().toISOString()
            }
        })
    });

    if (!updateResponse.ok) {
        const error = await updateResponse.json();
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to update record' })
        };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
    };
};