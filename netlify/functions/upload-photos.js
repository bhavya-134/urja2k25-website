// upload-photos.js
const Busboy = require('busboy');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

function driveClient() {
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    key,
    ['https://www.googleapis.com/auth/drive']
  );
  return google.drive({ version: 'v3', auth });
}

// Map eventId (frontend passed) to folder env var names
function folderIdForEvent(eventId) {
  if (!eventId) return process.env.GOOGLE_DRIVE_FOLDER_ID;
  const id = eventId.toLowerCase();
  const map = {
    aavishar: process.env.AAVISHAR_FOLDER_ID,
    abhivyakthi: process.env.ABHIVYAKTHI_FOLDER_ID,
    codetocircuit: process.env.CODE_TO_CIRCUIT_FOLDER_ID,
    cultural: process.env.CULTURAL_FOLDER_ID,
    sports: process.env.SPORTS_FOLDER_ID,
    workshops: process.env.WORKSHOPS_FOLDER_ID,
    competitions: process.env.COMPETITIONS_FOLDER_ID
  };
  return map[id] || process.env.GOOGLE_DRIVE_FOLDER_ID;
}

exports.handler = async (event) => {
  try {
    // Only accept POST
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    // Authorization: expect header 'Authorization: Bearer <uploadToken>'
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    if (!authHeader) return { statusCode: 401, body: 'Missing Authorization header' };
    const uploadToken = authHeader.replace(/^Bearer\s+/i, '');

    let payload;
    try {
      payload = jwt.verify(uploadToken, process.env.VERIFICATION_SECRET);
    } catch (e) {
      console.error('Invalid upload token', e);
      return { statusCode: 401, body: 'Invalid upload token' };
    }

    // Content type
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return { statusCode: 400, body: 'Content-Type must be multipart/form-data' };
    }

    const drive = driveClient();
    const parentFolder = folderIdForEvent(payload.eventId);

    // Use Busboy to parse the multipart body
    const bb = new Busboy({ headers: { 'content-type': contentType } });
    const uploaded = [];

    // convert base64 to buffer and feed busboy
    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    bb.end(bodyBuffer);

    // Wrap busboy events in a Promise
    await new Promise((resolve, reject) => {
      bb.on('file', (fieldname, fileStream, info) => {
        const { filename, mimeType } = info;
        const chunks = [];

        fileStream.on('data', (d) => chunks.push(d));
        fileStream.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            // Basic server-side file validation
            if (!mimeType.startsWith('image/')) {
              return; // skip non-images
            }
            // optional size limit: if you want to enforce, check buffer.length

            // Upload to Drive
            const createRes = await drive.files.create({
              requestBody: {
                name: filename,
                parents: [parentFolder]
              },
              media: {
                mimeType,
                body: Buffer.from(buffer)
              },
              fields: 'id, name'
            });

            const fileId = createRes.data.id;

            // Make file public (anyone with link can view)
            await drive.permissions.create({
              fileId,
              requestBody: { role: 'reader', type: 'anyone' }
            });

            // Get public links/metadata
            const meta = await drive.files.get({
              fileId,
              fields: 'id, name, mimeType, webViewLink, thumbnailLink'
            });

            // Build an accessible image URL (works for images)
            const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

            uploaded.push({
              id: meta.data.id,
              name: meta.data.name,
              mimeType: meta.data.mimeType,
              webViewLink: meta.data.webViewLink,
              thumbnailLink: meta.data.thumbnailLink,
              publicUrl
            });
          } catch (err) {
            console.error('File upload error', err);
          }
        });

        fileStream.on('error', (err) => {
          console.error('File stream error', err);
        });
      });

      bb.on('finish', () => resolve());
      bb.on('error', (err) => reject(err));
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, uploaded })
    };
  } catch (err) {
    console.error('upload-photos handler error', err);
    return { statusCode: 500, body: 'Server error during upload' };
  }
};