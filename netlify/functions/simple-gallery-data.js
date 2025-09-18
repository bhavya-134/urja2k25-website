// Alternative version that gets file content directly
const photos = [];
for (const file of files) {
  try {
    // Make sure file is public
    await drive.permissions.create({
      fileId: file.id,
      resource: { role: 'reader', type: 'anyone' }
    });
    
    // Use direct content URL
    photos.push({
      id: file.id,
      name: file.name,
      url: `https://lh3.googleusercontent.com/d/${file.id}=w800-h600`
    });
  } catch (err) {
    console.log(`Error with file ${file.id}: ${err.message}`);
  }
}