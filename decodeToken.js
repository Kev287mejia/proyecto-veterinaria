const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcnBpcXdjcnBkdG9xenlla3VnIiwic2VydmljZV9yb2xlIiwiaWF0IjoxNzgxNzM2ODQzLCJleHAiOjIwOTczMTI4NDN9.iDuyAzmqlvikSbcbm1N6j7fH9pijkVTOt6OJHeg2waA';
const parts = token.split('.');
const payload = Buffer.from(parts[1], 'base64').toString('utf8');
console.log("PAYLOAD:", payload);
