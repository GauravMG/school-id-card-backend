import { apiSlice } from '../apiSlice';

export const publicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSchool: builder.query({
      query: (slug) => `/public/schools/${slug}`,
    }),
    getPublicStudent: builder.query({
      query: ({ slug, rollNumber, classValue, sectionValue }) => ({
        url: `/public/schools/${slug}/student`,
        params: { rollNumber, classValue, sectionValue }
      }),
    }),
    getPublicFormFields: builder.query({
      query: (slug) => `/public/schools/${slug}/form-fields`,
    }),
    submitStudentDetails: builder.mutation({
      query: ({ slug, studentData }) => ({
        url: `/public/schools/${slug}/student`,
        method: 'POST',
        body: studentData,
      }),
    }),
    removeBackground: builder.mutation({
      query: (image) => ({
        url: '/public/remove-bg',
        method: 'POST',
        body: { image },
      }),
    }),
  }),
});

export const {
  useGetPublicSchoolQuery,
  useGetPublicStudentQuery,
  useGetPublicFormFieldsQuery,
  useSubmitStudentDetailsMutation,
  useRemoveBackgroundMutation,
} = publicApi;
