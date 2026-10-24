require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const Post = require("./PostModel");
const cors = require("cors");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = [
  "http://localhost:3000",
  "https://wrottit-i1cr.onrender.com",
];

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for multipart form data without files
const upload = multer();

// Render health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "posts",
  });
});

// GET ALL POSTS
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      message: "Unable to retrieve posts",
    });
  }
});

// GET POSTS BY USER
// Must be before /posts/:id
app.get("/posts/postsby/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const posts = await Post.find({ uid });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve user posts",
    });
  }
});

// GET POSTS BY COMMUNITY
app.get("/posts/communityPosts/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;

    const communityPosts = await Post.find({
      communityId: String(communityId),
    });

    res.status(200).json(communityPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve community posts",
    });
  }
});

// GET POST BY ID
app.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve post",
    });
  }
});

// CREATE POST
// Supports JSON and multipart form data without files
app.post("/posts", upload.none(), async (req, res) => {
  try {
    const {
      title,
      communityName,
      communityId,
      uid,
      uname,
      content,
      upvotes,
      images,
    } = req.body;

    if (!title || !uid) {
      return res.status(400).json({
        message: "Title and user ID are required",
      });
    }

    // Handle images submitted as JSON, a string,
    // or an array in multipart FormData
    let parsedImages = images || [];

    if (typeof parsedImages === "string") {
      try {
        const parsed = JSON.parse(parsedImages);
        parsedImages = Array.isArray(parsed) ? parsed : [parsedImages];
      } catch {
        parsedImages = [parsedImages];
      }
    }

    const post = new Post({
      title,
      communityName,
      communityId,
      uid,
      uname,
      content,
      upvotes: Number(upvotes) || 0,
      date: new Date(),
      comments: [],
      images: parsedImages,
    });

    const newPost = await post.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(400).json({
      message: "Unable to create post",
    });
  }
});

// ADD COMMENT TO POST
app.post("/posts/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, uname, comment } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (!uid || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({
        message: "User ID and comment are required",
      });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            uid,
            uname,
            comment,
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({
      message: "Unable to add comment",
    });
  }
});

// UPVOTE POST
// Preserves your existing route
app.post("/:id/upvotes", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true, runValidators: true },
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Upvote error:", error);
    res.status(500).json({
      message: "Unable to upvote post",
    });
  }
});

// START SERVER
async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected - Posts Server");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Posts Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
