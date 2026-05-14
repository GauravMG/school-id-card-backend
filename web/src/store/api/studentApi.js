import { apiSlice } from '../apiSlice';

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: ({ schoolId, page = 1, limit = 20, ...filters }) => ({
        url: `/students/schools/${schoolId}/students`,
        params: { page, limit, ...filters },
      }),
      providesTags: (result, error, { schoolId }) => {
        const items = result?.data?.items || (Array.isArray(result?.data) ? result.data : []);
        return items
          ? [
            ...items.map(({ id }) => ({ type: 'Student', id })),
            { type: 'Student', id: `LIST_${schoolId}` },
          ]
          : [{ type: 'Student', id: `LIST_${schoolId}` }];
      },
    }),
    createStudent: builder.mutation({
      query: ({ schoolId, student }) => ({
        url: `/students/schools/${schoolId}/students`,
        method: 'POST',
        body: student,
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'Student', id: `LIST_${schoolId}` }],
    }),
    updateStudent: builder.mutation({
      query: ({ schoolId, id, ...patch }) => ({
        url: `/students/schools/${schoolId}/students/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id, schoolId }) => [
        { type: 'Student', id },
        { type: 'Student', id: `LIST_${schoolId}` }
      ],
    }),
    deleteStudent: builder.mutation({
      query: ({ schoolId, id }) => ({
        url: `/students/schools/${schoolId}/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, schoolId }) => [
        { type: 'Student', id },
        { type: 'Student', id: `LIST_${schoolId}` }
      ],
    }),
    uploadStudentPhoto: builder.mutation({
      query: ({ schoolId, id, formData }) => ({
        url: `/students/schools/${schoolId}/students/${id}/photo`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
    }),
    importStudentsCsv: builder.mutation({
      query: ({ schoolId, formData }) => ({
        url: `/students/schools/${schoolId}/students/import-csv`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'Student', id: `LIST_${schoolId}` }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useUploadStudentPhotoMutation,
  useImportStudentsCsvMutation,
} = studentApi;
