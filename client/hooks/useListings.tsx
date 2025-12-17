import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import type { Listing } from "@/types/listing";
import { useAuth } from "@/hooks/useAuth";

interface ListingContextType {
  listings: Listing[];
  favorites: string[];
  isLoading: boolean;
  addListing: (listing: Omit<Listing, "id" | "createdAt">) => Promise<void>;
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  refetch: () => void;
}

const ListingContext = createContext<ListingContextType | undefined>(undefined);

export function ListingProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, isLoggedIn } = useAuth();
  const userId = user?.id || "guest-user";

  const { data: listings = [], isLoading: listingsLoading, refetch } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const { data: serverFavorites = [] } = useQuery<string[]>({
    queryKey: [`/api/favorites/${userId}`],
    enabled: isLoggedIn,
  });

  const [localFavorites, setLocalFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (isLoggedIn && serverFavorites.length > 0) {
      setLocalFavorites(serverFavorites);
    }
  }, [serverFavorites, isLoggedIn]);

  const addFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest("POST", "/api/favorites", {
        userId,
        listingId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}`] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/favorites/${userId}/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}`] });
    },
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

  const toggleFavorite = useCallback((listingId: string) => {
    setLocalFavorites((prev) => {
      const isFav = prev.includes(listingId);
      if (isFav) {
        if (isLoggedIn) {
          removeFavoriteMutation.mutate(listingId);
        }
        return prev.filter((id) => id !== listingId);
      } else {
        if (isLoggedIn) {
          addFavoriteMutation.mutate(listingId);
        }
        return [...prev, listingId];
      }
    });
  }, [isLoggedIn, addFavoriteMutation, removeFavoriteMutation]);

  const isFavorite = useCallback((listingId: string) => {
    return localFavorites.includes(listingId);
  }, [localFavorites]);

  return (
    <ListingContext.Provider
      value={{ 
        listings, 
        favorites: localFavorites, 
        isLoading: listingsLoading, 
        addListing, 
        toggleFavorite,
        isFavorite,
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
