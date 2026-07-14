import { apiSlice } from '../apiSlice';

export const schoolApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query({
      query: () => '/schools',
      providesTags: (result) => {
        const items = result?.data?.items || (Array.isArray(result?.data) ? result.data : []);
        return items
          ? [
              ...items.map(({ id }) => ({ type: 'School', id })),
              { type: 'School', id: 'LIST' },
            ]
          : [{ type: 'School', id: 'LIST' }];
      },
    }),
    getSchool: builder.query({
      query: (id) => `/schools/${id}`,
      providesTags: (result, error, id) => [{ type: 'School', id }],
    }),
    createSchool: builder.mutation({
      query: (school) => ({
        url: '/schools',
        method: 'POST',
        body: school,
      }),
      invalidatesTags: [{ type: 'School', id: 'LIST' }],
    }),
    updateSchool: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/schools/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'School', id }, { type: 'School', id: 'LIST' }],
    }),
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/schools/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'School', id }, { type: 'School', id: 'LIST' }],
    }),
    uploadSchoolAssets: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/uploads/schools/${id}/assets`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'School', id }],
    }),
    getTemplates: builder.query({
      query: () => '/templates',
    }),
    getSchoolFonts: builder.query({
      query: (schoolId) => `/schools/${schoolId}/fonts`,
      providesTags: (result, error, schoolId) => [{ type: 'SchoolFonts', id: schoolId }],
    }),
    updateSchoolFonts: builder.mutation({
      query: ({ schoolId, ...fonts }) => ({
        url: `/schools/${schoolId}/fonts`,
        method: 'PUT',
        body: fonts,
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'SchoolFonts', id: schoolId }],
    }),
    getSchoolFormFields: builder.query({
      query: (schoolId) => `/schools/${schoolId}/form-fields`,
      providesTags: (result, error, schoolId) => [{ type: 'SchoolFormFields', id: schoolId }],
    }),
    updateSchoolFormFields: builder.mutation({
      query: ({ schoolId, fields }) => ({
        url: `/schools/${schoolId}/form-fields`,
        method: 'PUT',
        body: { fields },
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'SchoolFormFields', id: schoolId }],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useUploadSchoolAssetsMutation,
  useGetTemplatesQuery,
  useGetSchoolFontsQuery,
  useUpdateSchoolFontsMutation,
  useGetSchoolFormFieldsQuery,
  useUpdateSchoolFormFieldsMutation,
} = schoolApi;
