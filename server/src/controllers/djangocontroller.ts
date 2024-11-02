import { Request, Response } from "express";
import axios from "axios";
import { io } from "../../index";

const DJANGO_API_URL = "http://127.0.0.1:8000/api/articles/";

export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10, search } = req.query;

  try {
    // Forward all query parameters to the Django API
    const response = await axios.get(`${DJANGO_API_URL}list/`, {
      params: { page, limit, search },
    });
    // console.log(`response.data   ${JSON.stringify(response.data)}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching articles from Django API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, content, categoryIds } = req.body;

  const thumbnailUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.thumbnailUrl;

  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const authorId = req.user.id;

    // Forward the request to Django
    const response = await axios.post(`${DJANGO_API_URL}create/`, {
      title,
      description,
      content,
      categoryIds,
      thumbnailurl: thumbnailUrl, // Make sure this matches the Django model field name
      authorid: authorId, // Make sure this matches the Django model field name
      username: req.user.username,
    });

    // Emit event to notify clients
    io.emit("articleCreated", response.data.article);

    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating article:", error);
    if (axios.isAxiosError(error) && error.response) {
      // Forward the error response from Django
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
