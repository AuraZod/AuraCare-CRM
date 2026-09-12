export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  siteName: import.meta.env.VITE_SITE_NAME || 'AuraCare CRM',
  orgName: import.meta.env.VITE_ORGANIZATION_NAME || 'AuraZod',
  githubUrl: import.meta.env.VITE_GITHUB_URL || 'https://github.com/AuraZod',
  isDevelopment: import.meta.env.VITE_DEVELOPMENT === 'true',
};
