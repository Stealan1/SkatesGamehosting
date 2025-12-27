import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { showToast } from '../utils/toast';
import type { CreateBookingRequest, PurchaseRequest } from '../types';

// Query Keys
export const queryKeys = {
  user: ['user'] as const,
  services: ['services'] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['booking', id] as const,
  packs: ['packs'] as const,
  vms: ['vms'] as const,
  vm: (id: string) => ['vm', id] as const,
  stats: ['stats'] as const,
  news: ['news'] as const,
  priceEstimate: (hours: number) => ['price', hours] as const,
};

// User Hooks
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: apiClient.auth.me,
  });
};

// Services Hooks
export const useServices = () => {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: apiClient.services.list,
  });
};

export const usePriceEstimate = (hours: number) => {
  return useQuery({
    queryKey: queryKeys.priceEstimate(hours),
    queryFn: () => apiClient.services.getPriceEstimate(hours),
    enabled: hours > 0,
  });
};

// Bookings Hooks
export const useBookings = () => {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: apiClient.bookings.list,
  });
};

export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: queryKeys.booking(bookingId),
    queryFn: () => apiClient.bookings.get(bookingId),
    enabled: !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => apiClient.bookings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.vms });
      showToast.success('Booking created successfully!');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create booking');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => apiClient.bookings.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.vms });
      showToast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to cancel booking');
    },
  });
};

// Shop Hooks
export const usePacks = () => {
  return useQuery({
    queryKey: queryKeys.packs,
    queryFn: apiClient.shop.listPacks,
  });
};

export const usePurchasePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseRequest) => apiClient.shop.purchase(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      showToast.success(`Successfully added ${response.hoursAdded} hours to your balance!`);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to complete purchase');
    },
  });
};

// VMs & Server Stats Hooks
export const useVMs = () => {
  return useQuery({
    queryKey: queryKeys.vms,
    queryFn: apiClient.vms.list,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useVM = (vmId: string) => {
  return useQuery({
    queryKey: queryKeys.vm(vmId),
    queryFn: () => apiClient.vms.get(vmId),
    enabled: !!vmId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useServerStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: apiClient.vms.stats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// News Hooks
export const useNews = () => {
  return useQuery({
    queryKey: queryKeys.news,
    queryFn: apiClient.news.list,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
