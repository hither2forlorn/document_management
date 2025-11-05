import { server } from "admin/config/server";

const url = "/logs";

async function paginationLogs(query) {
  const result = await server.get(`/logs/pagination`, {
    params: {
      searchingParameters: {
        search: query?.search,
      },
      page: query?.page,
      limit: query?.limit,
      queryId: query?.queryId,
    },
  });
  return result.data;
}

async function reporting() {
  const result = await server.get(`/logs/reporting`);
  return result.data;
}

export { paginationLogs, reporting };
