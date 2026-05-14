import { apiSlice } from '../apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      })
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      })
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST'
      })
    }),
    me: builder.query({
      query: () => '/auth/me'
    }),
    loginAs: builder.mutation({
      query: (payload) => ({
        url: '/auth/login-as',
        method: 'POST',
        body: payload
      })
    }),
    returnToAdmin: builder.mutation({
      query: () => ({
        url: '/auth/return-to-admin',
        method: 'POST'
      })
    })
  })
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useRefreshMutation, 
  useMeQuery,
  useLoginAsMutation,
  useReturnToAdminMutation
} = authApi;
