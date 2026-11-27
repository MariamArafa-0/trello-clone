/*
import { useState, useEffect } from "react";
import { getBoards } from "../services/boardService.js";

function useBoards() {

    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchBoards = async () => {

            try {
                const data = await getBoards();

                setBoards(data.boards);

            } catch (err) {
                setError(err.message);

            } finally {
                setLoading(false);
            }
        };

        fetchBoards();

    }, []);

    return {
        boards,
        loading,
        error
    };
}

export default useBoards;
*/


import { useState, useEffect } from "react";

function useBoards() {

    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        // Temporary sample data instead of calling the backend
        const mockBoards = [
            {
                _id: "1",
                title: "University Project",
                description: "Tasks and progress for our web project"
            },
            {
                _id: "2",
                title: "Machine Learning",
                description: "Hotel booking regression project"
            },
            {
                _id: "3",
                title: "Personal Tasks",
                description: "Things I need to finish"
            },
            {
                _id: "4",
                title: "Team Work",
                description: "Tasks shared with my teammates"
            }
        ];

        setBoards(mockBoards);
        setLoading(false);

    }, []);

    return {
        boards,
        loading,
        error
    };
}

export default useBoards;
