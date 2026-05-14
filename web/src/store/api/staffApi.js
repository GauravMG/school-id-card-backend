import { apiSlice } from '../apiSlice';

export const staffApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query({
      query: (schoolId) => `/staff/schools/${schoolId}/staff`,
      providesTags: (result, error, schoolId) => {
        const items = result?.data?.items || (Array.isArray(result?.data) ? result.data : []);
        return items
          ? [
            ...items.map(({ id }) => ({ type: 'Staff', id })),
            { type: 'Staff', id: `LIST_${schoolId}` },
          ]
          : [{ type: 'Staff', id: `LIST_${schoolId}` }];
      },
    }),
    createStaff: builder.mutation({
      query: ({ schoolId, staff }) => ({
        url: `/staff/schools/${schoolId}/staff`,
        method: 'POST',
        body: staff,
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'Staff', id: `LIST_${schoolId}` }],
    }),
    updateStaff: builder.mutation({
      query: ({ schoolId, id, ...patch }) => ({
        url: `/staff/schools/${schoolId}/staff/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id, schoolId }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: `LIST_${schoolId}` }
      ],
    }),
    deleteStaff: builder.mutation({
      query: ({ schoolId, id }) => ({
        url: `/staff/schools/${schoolId}/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, schoolId }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: `LIST_${schoolId}` }
      ],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;
