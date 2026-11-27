
import apiRequest from "./api.js";

// Get all boards belonging to the logged-in user
export const getBoards = async () => {

    const data = await apiRequest("/boards", {
        method: "GET"
    });

    return data;
};
