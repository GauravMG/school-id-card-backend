import { apiSlice } from '../apiSlice';

export const templateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query({
      query: () => '/templates',
      providesTags: ['Template'],
    }),
  }),
});

export const { useGetTemplatesQuery } = templateApi;
