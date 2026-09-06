import { apiClient } from "./axios";

export const createEvent = async (payload) => {
  const { data } = await apiClient.post(
    "/events",
    payload
  );

  return data.data.event;
};

export const updateEvent = async (id, payload) => {
  const { data } = await apiClient.put(
    `/events/${id}`,
    payload
  );

  return data.data.event;
};

export const deleteEvent = async (id) => {
  return apiClient.delete(`/events/${id}`);
};
