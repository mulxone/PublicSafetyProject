// import { createClient } from '@supabase/supabase-js';
// import 'react-native-url-polyfill/auto';

// const SUPABASE_URL = 'https://fyxpeudunbwiyszkpiul.supabase.co';
// const SUPABASE_ANON_KEY =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eHBldWR1bmJ3aXlzemtwaXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE3OTIsImV4cCI6MjA3ODE0Nzc5Mn0.HXDUc0AgPOphoxHxcBp60HVrFbCSBC1ljjmcuvfVTsA';

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// lib/supabase.ts
import 'react-native-url-polyfill/auto'; // must come first
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fyxpeudunbwiyszkpiul.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eHBldWR1bmJ3aXlzemtwaXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE3OTIsImV4cCI6MjA3ODE0Nzc5Mn0.HXDUc0AgPOphoxHxcBp60HVrFbCSBC1ljjmcuvfVTsA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // Optional: set global fetch to React Native fetch
  global: { fetch },
});
