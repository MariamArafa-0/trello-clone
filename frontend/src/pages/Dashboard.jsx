
import useBoards from "../hooks/useBoards.js";
import BoardCard from "../features/boards/BoardCard.jsx";
import "./Dashboard.css";
function Dashboard() {

    const { boards, loading, error } = useBoards();

    if (loading) {
        return <p>Loading boards...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="dashboard">

            <h1>Your Boards</h1>

            {boards.length === 0 ? (

                <p>You don't have any boards yet.</p>

            ) : (

                <div className="boards-grid">

                    {boards.map((board) => (
                        <BoardCard
                            key={board._id}
                            board={board}
                        />
                    ))}

                </div>

            )}

        </div>
    );
}

export default Dashboard;
