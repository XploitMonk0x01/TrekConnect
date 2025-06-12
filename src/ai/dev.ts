
import { config } from 'dotenv';
config();

import '@/ai/flows/smart-match-recommendations.ts';
import '@/ai/flows/suggest-travel-destinations.ts';
import '@/ai/flows/generate-trek-image-flow.ts';
import '@/ai/flows/suggest-story-tags-flow.ts'; 
import '@/ai/flows/generate-custom-trek-route-flow.ts';
import '@/ai/flows/filter-destinations-flow.ts'; // Added new AI filter flow

  
