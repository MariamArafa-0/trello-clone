
import Board from "../models/Board.js";
import mongoose from "mongoose";
import User from "../models/User.js";
//Create a new board
export const createBoard = async (req, res) => {

    try {

        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Board title is required"
            });
        }

        const newBoard = await Board.create({

            title: title.trim(),
            description: description || "",
            owner: req.user._id,
            members: [req.user._id]

        });

        return res.status(201).json({
            message: "Board created successfully",
            board: newBoard
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};


// Get all boards belonging to the logged-in user
export const getMyBoards = async (req, res) => {
    try {
        const userId = req.user._id;

        const boards = await Board.find({
            $or: [
                { owner: userId },
                { members: userId }
            ]
        }).sort({ updatedAt: -1 });

        // Get the IDs of the boards starred by this user
        const starredBoardIds = (req.user.starredBoards || []).map(
            id => id.toString()
        );

        // Add isStarred to each board in the response
        const boardsWithStarStatus = boards.map(board => ({
            ...board.toObject(),
            isStarred: starredBoardIds.includes(board._id.toString())
        }));

        return res.status(200).json({
            message: "Boards retrieved successfully",
            count: boardsWithStarStatus.length,
            boards: boardsWithStarStatus
        });

    } catch (error) {
        console.error("Get boards error:", error);

        return res.status(500).json({
            message: "Server error while retrieving boards"
        });
    }
};
// Get a specific board by ID
export const getBoardById = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner = board.owner.toString() === userId.toString();

        const isMember = board.members.some(
            memberId => memberId.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not allowed to access this board"
            });
        }

        const isStarred = (req.user.starredBoards || []).some(
            id => id.toString() === board._id.toString()
        );

        return res.status(200).json({
            message: "Board retrieved successfully",
            board: {
                ...board.toObject(),
                isStarred
            }
        });

    } catch (error) {
        console.error("Get board error:", error);

        return res.status(500).json({
            message: "Server error while retrieving board"
        });
    }
};
// Update board information
export const updateBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner = board.owner.toString() === userId.toString();

        const isMember = board.members.some(
            memberId => memberId.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not allowed to update this board"
            });
        }

        // 4. Get the updated information from the request body
        const { title, description, isArchived } = req.body;

        // 5. Validate the title if provided
        //only change the title if the client actually provided it.
        //Making PUT endpoint support partial updates too
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    message: "Board title cannot be empty"
                });
            }

            board.title = title.trim();
        }

        // 6. Update description if provided
        if (description !== undefined) {
            if (typeof description !== "string") {
                return res.status(400).json({
                    message: "Description must be a string"
                });
            }

            board.description = description;
        }

        if (isArchived !== undefined) {
            if (typeof isArchived !== "boolean") {
                return res.status(400).json({
                    message: "isArchived must be a boolean"
                });
            }

            board.isArchived = isArchived;
        }

        await board.save();

        return res.status(200).json({
            message: "Board updated successfully",
            board
        });

    } catch (error) {
        console.error("Update board error:", error);

        return res.status(500).json({
            message: "Server error while updating board"
        });
    }
};

export const addBoardMember = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user._id;
        const { memberId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                message: "Valid member ID is required"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner =
            board.owner.toString() === userId.toString();

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the board owner can add members"
            });
        }

        const newMember = await User.findById(memberId);

        if (!newMember) {
            return res.status(404).json({
                message: "User to invite was not found"
            });
        }

        const alreadyMember = board.members.some(
            id => id.toString() === memberId.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "User is already a board member"
            });
        }

        board.members.push(memberId);

        await board.save();

        return res.status(200).json({
            message: "Member added successfully",
            board
        });

    } catch (error) {
        console.error("Add board member error:", error);

        return res.status(500).json({
            message: "Server error while adding member"
        });
    }
};

export const removeBoardMember = async (req, res) => {
    try {
        const boardId = req.params.id;
        const memberId = req.params.userId;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({
                message: "Invalid member ID"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner =
            board.owner.toString() === userId.toString();

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the board owner can remove members"
            });
        }

        if (board.owner.toString() === memberId.toString()) {
            return res.status(400).json({
                message: "The board owner cannot be removed"
            });
        }

        const isMember = board.members.some(
            id => id.toString() === memberId.toString()
        );

        if (!isMember) {
            return res.status(404).json({
                message: "User is not a member of this board"
            });
        }

        board.members = board.members.filter(
            id => id.toString() !== memberId.toString()
        );

        await board.save();

        return res.status(200).json({
            message: "Member removed successfully",
            board
        });

    } catch (error) {
        console.error("Remove board member error:", error);

        return res.status(500).json({
            message: "Server error while removing member"
        });
    }
};

export const toggleStarBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner =
            board.owner.toString() === userId.toString();

        const isMember = board.members.some(
            id => id.toString() === userId.toString()
        );

        if (!isOwner && !isMember) {
            return res.status(403).json({
                message: "You are not allowed to access this board"
            });
        }

        const isStarred = await User.exists({
            _id: userId,
            starredBoards: boardId
        });

        if (isStarred) {
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    starredBoards: boardId
                }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    starredBoards: boardId
                }
            });
        }

        return res.status(200).json({
            message: isStarred
                ? "Board unstarred successfully"
                : "Board starred successfully",

            isStarred: !isStarred
        });

    } catch (error) {
        console.error("Toggle star error:", error);

        return res.status(500).json({
            message: "Server error while toggling star"
        });
    }
};


export const deleteBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(boardId)) {
            return res.status(400).json({
                message: "Invalid board ID"
            });
        }

        const board = await Board.findById(boardId);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const isOwner =
            board.owner.toString() === userId.toString();

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the board owner can delete this board"
            });
        }

        await Board.findByIdAndDelete(boardId);

        await User.updateMany(
            { starredBoards: boardId },
            {
                $pull: {
                    starredBoards: boardId
                }
            }
        );

        return res.status(200).json({
            message: "Board deleted successfully"
        });

    } catch (error) {
        console.error("Delete board error:", error);

        return res.status(500).json({
            message: "Server error while deleting board"
        });
    }
};
