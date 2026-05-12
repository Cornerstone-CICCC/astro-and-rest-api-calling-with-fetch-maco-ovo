import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("  body:", req.body);
  }
  next();
});

type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

let posts: Post[] = [
  { id: 1, userId: 1, title: "Hello world", body: "This is the first post." },
  { id: 2, userId: 1, title: "Express demo", body: "Built with TypeScript." },
  { id: 3, userId: 2, title: "JSON & APIs", body: "Lecture sample post." },
];

let nextId = posts.length + 1;

app.get("/", (_req, res) => {
  res.json({
    message: "Demo Express backend is running",
    endpoints: [
      "GET    /posts",
      "GET    /posts/:id",
      "POST   /posts",
      "PUT    /posts/:id",
      "PATCH  /posts/:id",
      "DELETE /posts/:id",
    ],
  });
});

app.get("/posts", (_req, res) => {
  console.log(`  -> returning ${posts.length} posts`);
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (!post) {
    console.log(`  -> post ${id} not found`);
    return res.status(404).json({ error: `Post ${id} not found` });
  }
  console.log(`  -> returning post ${id}`);
  res.json(post);
});

app.post("/posts", (req, res) => {
  const { title, body, userId } = req.body ?? {};
  if (!title || !body || userId === undefined) {
    console.log("  -> missing fields");
    return res
      .status(400)
      .json({ error: "title, body, and userId are required" });
  }
  const newPost: Post = { id: nextId++, userId, title, body };
  posts.push(newPost);
  console.log(`  -> created post ${newPost.id}`);
  res.status(201).json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, body, userId } = req.body ?? {};
  if (!title || !body || userId === undefined) {
    console.log("  -> missing fields for PUT");
    return res
      .status(400)
      .json({ error: "title, body, and userId are required for PUT" });
  }
  const index = posts.findIndex((p) => p.id === id);
  const replaced: Post = { id, userId, title, body };
  if (index === -1) {
    posts.push(replaced);
    console.log(`  -> created via PUT, id ${id}`);
    return res.status(201).json(replaced);
  }
  posts[index] = replaced;
  console.log(`  -> replaced post ${id}`);
  res.json(replaced);
});

app.patch("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) {
    console.log(`  -> post ${id} not found for PATCH`);
    return res.status(404).json({ error: `Post ${id} not found` });
  }
  posts[index] = { ...posts[index], ...req.body, id };
  console.log(`  -> patched post ${id}`);
  res.json(posts[index]);
});

app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = posts.length;
  posts = posts.filter((p) => p.id !== id);
  if (posts.length === before) {
    console.log(`  -> post ${id} not found for DELETE`);
    return res.status(404).json({ error: `Post ${id} not found` });
  }
  console.log(`  -> deleted post ${id}`);
  res.json({ message: `Post ${id} deleted` });
});

app.use((req, res) => {
  console.log(`  -> 404 no route for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
