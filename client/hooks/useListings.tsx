import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import type { Listing } from "@/types/listing";

interface ListingContextType {
  listings: Listing[];
  favorites: string[];
  isLoading: boolean;
  addListing: (listing: Omit<Listing, "id" | "createdAt">) => Promise<void>;
  toggleFavorite: (listingId: string) => void;
  refetch: () => void;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

const GUEST_USER_ID = "guest-user";

export function ListingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  const { data: listings = [], isLoading, refetch } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const createListingMutation = useMutation({
    mutationFn: async (newListing: Omit<Listing, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/listings", newListing);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });

  const addListing = async (newListing: Omit<Listing, "id" | "createdAt">) => {
    await createListingMutation.mutateAsync(newListing);
  };

  const toggleFavorite = (listingId: string) => {
    setLocalFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    );
  };

  return (
    <ListingContext.Provider
      value={{ 
        listings, 
        favorites: localFavorites, 
        isLoading, 
        addListing, 
        toggleFavorite,
        refetch,
      }}
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
