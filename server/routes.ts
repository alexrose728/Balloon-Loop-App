import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { listings, favorites, users, messages } from "@shared/schema";
import { eq, and, desc, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const existing = await db.select().from(users).where(eq(users.username, username));
      if (existing.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword,
      }).returning();
      
      res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
      console.error("Error signing up:", error);
      res.status(500).json({ error: "Failed to sign up" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const [user] = await db.select().from(users).where(eq(users.username, username));
      
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  // Social login (Apple/Google)
  app.post("/api/auth/social", async (req, res) => {
    try {
      const { provider, email, name, providerId, identityToken } = req.body;
      
      if (!provider || !providerId) {
        return res.status(400).json({ error: "Provider and provider ID are required" });
      }

      // For Apple Sign-In, validate the identity token
      if (provider === "apple") {
        if (!identityToken) {
          return res.status(400).json({ error: "Identity token is required for Apple Sign-In" });
        }
        
        // Decode and verify the JWT payload (basic validation)
        // In production, you should verify the token signature with Apple's public keys
        try {
          const tokenParts = identityToken.split(".");
          if (tokenParts.length !== 3) {
            return res.status(401).json({ error: "Invalid identity token format" });
          }
          
          const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
          
          // Verify the subject matches the provided user ID
          if (payload.sub !== providerId) {
            return res.status(401).json({ error: "Token subject mismatch" });
          }
          
          // Verify the token hasn't expired
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            return res.status(401).json({ error: "Token has expired" });
          }
          
          // Verify the issuer is Apple
          if (payload.iss !== "https://appleid.apple.com") {
            return res.status(401).json({ error: "Invalid token issuer" });
          }
        } catch (tokenError) {
          console.error("Token validation error:", tokenError);
          return res.status(401).json({ error: "Failed to validate identity token" });
        }
      }

      const socialUsername = `${provider}_${providerId}`;
      const displayName = name || email?.split("@")[0] || `${provider}User`;
      
      const [existingUser] = await db.select().from(users).where(eq(users.username, socialUsername));
      
      if (existingUser) {
        res.json({ 
          id: existingUser.id, 
          username: displayName,
          email 
        });
      } else {
        const randomPassword = await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS);
        
        const [newUser] = await db.insert(users).values({
          username: socialUsername,
          password: randomPassword,
        }).returning();
        
        res.status(201).json({ 
          id: newUser.id, 
          username: displayName,
          email 
        });
      }
    } catch (error) {
      console.error("Error with social login:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

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

  // Get conversations for a user (grouped by listing and other user)
  app.get("/api/messages/conversations/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Get all messages where user is sender or receiver
      const allMessages = await db
        .select()
        .from(messages)
        .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
        .orderBy(desc(messages.createdAt));
      
      // Group by conversation (unique combination of other user + listing)
      const conversationsMap = new Map<string, {
        listingId: string;
        otherUserId: string;
        lastMessage: typeof allMessages[0];
        unreadCount: number;
      }>();
      
      for (const msg of allMessages) {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const key = `${msg.listingId}-${otherUserId}`;
        
        if (!conversationsMap.has(key)) {
          conversationsMap.set(key, {
            listingId: msg.listingId,
            otherUserId,
            lastMessage: msg,
            unreadCount: msg.receiverId === userId && msg.read === "false" ? 1 : 0,
          });
        } else {
          const conv = conversationsMap.get(key)!;
          if (msg.receiverId === userId && msg.read === "false") {
            conv.unreadCount++;
          }
        }
      }
      
      // Enrich with listing and user info
      const conversations = [];
      for (const conv of conversationsMap.values()) {
        const [listing] = await db.select().from(listings).where(eq(listings.id, conv.listingId));
        const [otherUser] = await db.select().from(users).where(eq(users.id, conv.otherUserId));
        
        conversations.push({
          listingId: conv.listingId,
          listingTitle: listing?.title || "Unknown Listing",
          listingImage: listing?.images?.[0] || null,
          otherUserId: conv.otherUserId,
          otherUserName: otherUser?.username || "Unknown User",
          lastMessage: conv.lastMessage.content,
          lastMessageTime: conv.lastMessage.createdAt,
          unreadCount: conv.unreadCount,
        });
      }
      
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/messages/:userId/:listingId/:otherUserId", async (req, res) => {
    try {
      const { userId, listingId, otherUserId } = req.params;
      
      const conversationMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.listingId, listingId),
            or(
              and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
              and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
            )
          )
        )
        .orderBy(messages.createdAt);
      
      // Mark messages as read
      await db
        .update(messages)
        .set({ read: "true" })
        .where(
          and(
            eq(messages.listingId, listingId),
            eq(messages.senderId, otherUserId),
            eq(messages.receiverId, userId)
          )
        );
      
      res.json(conversationMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const { senderId, receiverId, listingId, content } = req.body;
      
      if (!senderId || !receiverId || !listingId || !content) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const [newMessage] = await db.insert(messages).values({
        senderId,
        receiverId,
        listingId,
        content,
      }).returning();
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
