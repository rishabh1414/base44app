import { createClient } from "@base44/sdk";
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ec58fa4cb2676e7b47f15e",
  requiresAuth: true, // Ensure authentication is required for all operations
});
