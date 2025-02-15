
const { createClient } = require('@supabase/supabase-js')

const client = createClient(
    'https://vgxutbppaweffcyytave.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZneHV0YnBwYXdlZmZjeXl0YXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyMzc4MjQsImV4cCI6MjAzOTgxMzgyNH0.D_LoRgWm-tH5H5_4RdPFmjD4o2dtuuJm-QElwcYkEMo');

const channel = client.channel('connection');

channel.subscribe(_ => {
    console.log(_);
});
