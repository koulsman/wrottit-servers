require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const User = require("./UserModel");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = process.env.PORT || 3001;
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

// Parse JSON
app.use(express.json());

// Health check for Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "users",
  });
});

// Hide password hashes from API responses
const safeUser = (user) => {
  const result = user.toObject();
  delete result.password;
  return result;
};

// CREATE USER
app.post("/users", async (req, res) => {
  try {
    const { name, email, password, userImage } = req.body;

    if (
      !name ||
      !email ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Name, email and password (8+ characters) are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // IMPORTANT:
    // This version hashes the password here.
    // Remove any password hashing middleware from UserModel
    // to avoid hashing it twice.
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userImage,
    });

    const newUser = await user.save();

    res.status(201).json(safeUser(newUser));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Registration error:", error);
    res.status(500).json({
      message: "Unable to register user",
    });
  }
});

// LOGIN
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
});

// GET USER BY ID
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve user",
    });
  }
});

// ADD COMMENTED POST TO USER
app.post("/users/:uid/commented", async (req, res) => {
  try {
    const { uid } = req.params;
    const { id } = req.body;

    if (!mongoose.isValidObjectId(uid) || !id) {
      return res.status(400).json({
        message: "Valid user ID and comment ID required",
      });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { $push: { commented: { id } } },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update commented posts",
    });
  }
});

// ADD LIKED POST TO USER
app.post("/users/:uid/liked", async (req, res) => {
  try {
    const { uid } = req.params;
    const { id } = req.body;

    if (!mongoose.isValidObjectId(uid) || !id) {
      return res.status(400).json({
        message: "Valid user ID and post ID required",
      });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { $addToSet: { liked: { id } } },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update liked posts",
    });
  }
});

// ADD CREATED POST TO USER
app.post("/users/:uid/posts", async (req, res) => {
  try {
    const { uid } = req.params;
    const { id } = req.body;

    if (!mongoose.isValidObjectId(uid) || !id) {
      return res.status(400).json({
        message: "Valid user ID and post ID required",
      });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { $push: { posts: { id } } },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(safeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update user posts",
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
    console.log("MongoDB connected - Users Server");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Users Server running on port ${PORT}`);
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
