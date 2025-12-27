import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hxzvsqienfwawhzirzhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4enZzcWllbmZ3YXdoemlyemh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDU5NjMsImV4cCI6MjA4MjM4MTk2M30.wSaGevKwHIakGnCawsJubh5bhRd5PV9QCN-udVwLz3o';

export const supabase = createClient(supabaseUrl, supabaseKey);