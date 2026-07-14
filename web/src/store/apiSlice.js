import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from './auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    
    // try to get a new token
    const refreshToken = api.getState().auth.refreshToken;
    const refreshResult = await baseQuery(
      { 
        url: '/auth/refresh', 
        method: 'POST',
        body: { refreshToken }
      }, 
      api, 
      extraOptions
    );
    

    if (refreshResult.data) {
      const newAccessToken = refreshResult.data?.data?.accessToken || refreshResult.data?.data?.token;
      const newRefreshToken = refreshResult.data?.data?.refreshToken;
      
      if (newAccessToken) {
        // store the new token
        api.dispatch(setCredentials({ 
          user: api.getState().auth.user, 
          token: newAccessToken,
          refreshToken: newRefreshToken
        }));
        // retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.warn('Refresh returned data but no token found');
        api.dispatch(logout());
      }
    } else {
      console.error('Refresh failed:', refreshResult.error);
      api.dispatch(logout());
    }
  }
  return result;
};

// Initialize an empty api service that we'll inject endpoints into later as needed
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'School', 'Staff', 'Template', 'Student', 'ExportSetting', 'SchoolFonts', 'SchoolFormFields', 'AuditLog'],
  endpoints: () => ({})
});
