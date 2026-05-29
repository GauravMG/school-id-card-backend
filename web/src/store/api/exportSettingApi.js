import { apiSlice } from '../apiSlice';

export const exportSettingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExportSettings: builder.query({
      query: () => '/export-settings',
      providesTags: [{ type: 'ExportSetting', id: 'LIST' }],
    }),
    getActiveExportSettings: builder.query({
      query: () => '/export-settings/active',
      providesTags: [{ type: 'ExportSetting', id: 'ACTIVE' }],
    }),
    createExportSetting: builder.mutation({
      query: (data) => ({
        url: '/export-settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ExportSetting', id: 'LIST' }, { type: 'ExportSetting', id: 'ACTIVE' }],
    }),
    updateExportSetting: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/export-settings/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: [{ type: 'ExportSetting', id: 'LIST' }, { type: 'ExportSetting', id: 'ACTIVE' }],
    }),
    deleteExportSetting: builder.mutation({
      query: (id) => ({
        url: `/export-settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ExportSetting', id: 'LIST' }, { type: 'ExportSetting', id: 'ACTIVE' }],
    }),
  }),
});

export const {
  useGetExportSettingsQuery,
  useGetActiveExportSettingsQuery,
  useCreateExportSettingMutation,
  useUpdateExportSettingMutation,
  useDeleteExportSettingMutation,
} = exportSettingApi;
