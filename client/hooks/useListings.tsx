import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Listing } from "@/types/listing";

interface ListingContextType {
  listings: Listing[];
  favorites: string[];
  addListing: (listing: Omit<Listing, "id" | "createdAt">) => void;
  toggleFavorite: (listingId: string) => void;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Elegant Pink & Gold Birthday Arch",
    description:
      "A stunning balloon arch featuring blush pink and metallic gold balloons, perfect for milestone birthdays. This creation includes over 200 balloons in various sizes for a dramatic cascading effect.",
    eventType: "Birthday",
    colors: ["Pink", "Gold"],
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    ],
    latitude: 37.7849,
    longitude: -122.4094,
    creatorId: "user1",
    creatorName: "Sarah M.",
    createdAt: new Date("2024-12-10"),
  },
  {
    id: "2",
    title: "Romantic Wedding Entrance",
    description:
      "Classic white and blush pink balloon garland designed for wedding venues. Perfect for photo opportunities and creating an unforgettable entrance.",
    eventType: "Wedding",
    colors: ["White", "Pink"],
    images: [
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800",
    ],
    latitude: 37.7649,
    longitude: -122.4294,
    creatorId: "user2",
    creatorName: "Creative Balloons Co.",
    createdAt: new Date("2024-12-08"),
  },
  {
    id: "3",
    title: "Corporate Event Blue Theme",
    description:
      "Professional balloon installation featuring various shades of blue with silver accents. Great for corporate events and product launches.",
    eventType: "Corporate",
    colors: ["Blue", "Silver"],
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
    ],
    latitude: 37.7949,
    longitude: -122.3994,
    creatorId: "user3",
    creatorName: "Event Designs Inc.",
    createdAt: new Date("2024-12-05"),
  },
  {
    id: "4",
    title: "Baby Shower Pastel Dream",
    description:
      "Soft pastel rainbow arch perfect for baby showers. Features gentle lavender, mint, and peach tones with delicate white accents.",
    eventType: "Baby Shower",
    colors: ["Purple", "Green", "Pink", "White"],
    images: [
      "https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=800",
    ],
    latitude: 37.7549,
    longitude: -122.4394,
    creatorId: "user1",
    creatorName: "Sarah M.",
    createdAt: new Date("2024-12-01"),
  },
];

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export function ListingProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [favorites, setFavorites] = useState<string[]>(["1"]);

  const addListing = (newListing: Omit<Listing, "id" | "createdAt">) => {
    const listing: Listing = {
      ...newListing,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setListings((prev) => [listing, ...prev]);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    );
  };

  return (
    <ListingContext.Provider
      value={{ listings, favorites, addListing, toggleFavorite }}
    >
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error("useListing must be used within a ListingProvider");
  }
  return context;
}
