exports.handler = async (event, context) => {
  const sampleData = {
    'aavishar': [
      'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Aavishar+1',
      'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Aavishar+2'
    ],
    'abhivyakthi': [
      'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Abhivyakthi+1'
    ],
    'code-to-circuit': [
      'https://via.placeholder.com/400x300/45b7d1/ffffff?text=Code+Circuit+1'
    ],
    'cultural': [],
    'sports': [],
    'workshops': [],
    'competitions': []
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(sampleData)
  };
};