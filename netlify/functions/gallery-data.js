exports.handler = async (event, context) => {
  const sampleData = {
    'aavishar': [
      'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Aavishar+1',
      'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Aavishar+2',
      'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Uploaded+Photo+1'
    ],
    'abhivyakthi': [
      'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Abhivyakthi+1',
      'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Uploaded+Photo+2'
    ],
    'code-to-circuit': [
      'https://via.placeholder.com/400x300/45b7d1/ffffff?text=Code+Circuit+1',
      'https://via.placeholder.com/400x300/45b7d1/ffffff?text=Code+Circuit+2',
      'https://via.placeholder.com/400x300/45b7d1/ffffff?text=Uploaded+Photo+3'
    ],
    'cultural': [
      'https://via.placeholder.com/400x300/f7b731/ffffff?text=Cultural+1'
    ],
    'sports': [
      'https://via.placeholder.com/400x300/5f27cd/ffffff?text=Sports+1'
    ],
    'workshops': [
      'https://via.placeholder.com/400x300/00d2d3/ffffff?text=Workshop+1'
    ],
    'competitions': [
      'https://via.placeholder.com/400x300/ff9ff3/ffffff?text=Competition+1'
    ]
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(sampleData)
  };
};