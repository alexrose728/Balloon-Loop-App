import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { listings, favorites, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const allListings = await db.select().from(listings).orderBy(desc(listings.createdAt));
      res.json(allListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const [listing] = await db.select().from(listings).where(eq(listings.id, req.params.id));
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Create listing
  app.post("/api/listings", async (req, res) => {
    try {
      const { title, description, eventType, colors, images, latitude, longitude, address, creatorId, creatorName } = req.body;
      
      const [newListing] = await db.insert(listings).values({
        title,
        description,
        eventType,
        colors,
        images,
        latitude,
        longitude,
        address,
        creatorId,
        creatorName,
      }).returning();
      
      res.status(201).json(newListing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // Delete listing
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      await db.delete(favorites).where(eq(favorites.listingId, req.params.id));
      await db.delete(listings).where(eq(listings.id, req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // Get user favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userFavorites = await db
        .select({ listingId: favorites.listingId })
        .from(favorites)
        .where(eq(favorites.userId, req.params.userId));
      res.json(userFavorites.map(f => f.listingId));
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, listingId } = req.body;
      
      const existing = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
      
      if (existing.length > 0) {
        return res.status(200).json({ message: "Already favorited" });
      }
      
      const [newFavorite] = await db.insert(favorites).values({
        userId,
        listingId,
      }).returning();
      
      res.status(201).json(newFavorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:userId/:listingId", async (req, res) => {
    try {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, req.params.userId), eq(favorites.listingId, req.params.listingId)));
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
