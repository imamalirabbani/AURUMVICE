const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fhljkxnptsbiopncbmmg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobGpreG5wdHNiaW9wbmNibW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMjgwMjcsImV4cCI6MjA5MzcwNDAyN30.DqtcVfDTQS0zxV2bA5RXvX6aIYKfTDf29E7QuLXYwQE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = { supabase };
