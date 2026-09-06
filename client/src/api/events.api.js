import { apiClient } from "./axios";

export const getEvents = async (params = {}) => {
  const response = await apiClient.get("/events", {
    params,
  });

  console.log("========== EVENTS RESPONSE ==========");
  console.log(response);
  console.log(response.data);
  console.log(response.data.data);
  console.log("====================================");

  return response.data.data;
};

export const getEventById = async (id) => {
  console.log("Loading Event:", id);

  const response = await apiClient.get(`/events/${id}`);

  console.log("FULL RESPONSE:", response);
  console.log("RESPONSE DATA:", response.data);

  return response.data.data.event;
};

export const getPublishedEvents = async () => {
  const response = await apiClient.get("/events/published");

  return response.data.data.events;
};

export const getOpenRegistrationEvents = async () => {
  const response = await apiClient.get("/events/open-registration");

  return response.data.data.events;
};
