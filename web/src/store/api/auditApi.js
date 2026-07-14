import { apiSlice } from '../apiSlice';

export const auditApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: (params) => ({
        url: '/audit-logs',
        params,
      }),
      providesTags: ['AuditLog'],
    }),
    getAuditActionTypes: builder.query({
      query: () => '/audit-logs/action-types',
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetAuditActionTypesQuery } = auditApi;
