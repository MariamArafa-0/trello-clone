//To reuse common HTTP request logic general fetch function per endpoint(api request) is created to avoid code duplication and make it easier to maintain the codebase. It takes an endpoint and options as parameters, constructs the full URL, and makes a fetch request. The response is then parsed as JSON, and if the response is not ok, an error is thrown with a message from the response or a default message.



const API_BASE_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {

    // Get the JWT token from localStorage
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",

            // Add the Authorization header if a token exists
            ...(token && { Authorization: `Bearer ${token}` }),

            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export default apiRequest;

