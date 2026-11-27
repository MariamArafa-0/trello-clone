import "./BoardCard.css";
function BoardCard(props) {
    const board = props.board;
    return (
        <div className="board-card">

            <h3>{board.title}</h3>

            <p>{board.description || "No description"}</p>

        </div>
    );
}

export default BoardCard;

