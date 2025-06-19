import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Poll hooks
export const usePolls = () => {
  return useQuery({
    queryKey: ['polls'],
    queryFn: api.getPolls,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useCurrentPoll = () => {
  return useQuery({
    queryKey: ['currentPoll'],
    queryFn: api.getCurrentPoll,
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
};

export const useEndPoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.endPoll,
    onSuccess: () => {
      queryClient.invalidateQueries(['currentPoll']);
      queryClient.invalidateQueries(['polls']);
    },
  });
};

// Student hooks
export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: api.getStudents,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
};

export const useKickStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.kickStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
    },
  });
};

// Chat hooks
export const useChatMessages = () => {
  return useQuery({
    queryKey: ['chatMessages'],
    queryFn: api.getChatMessages,
    refetchInterval: 2000, // Refetch every 2 seconds
  });
}; 