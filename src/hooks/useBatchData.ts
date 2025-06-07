
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBatchInfo, getBatchEnrollmentCount } from '@/services/database';

export interface BatchWithEnrollment {
  id: string;
  name: string;
  time: string;
  capacity: number;
  enrolled: number;
  icon: string;
  price: string;
  batch_type: 'morning' | 'evening' | 'full' | 'private';
}

export const useBatchData = () => {
  const [batches, setBatches] = useState<BatchWithEnrollment[]>([]);

  const { data: batchInfo, isLoading, error } = useQuery({
    queryKey: ['batchInfo'],
    queryFn: getBatchInfo,
  });

  useEffect(() => {
    const fetchBatchesWithEnrollment = async () => {
      if (!batchInfo) return;

      console.log('Processing batch info with enrollment counts...');
      
      const batchesWithEnrollment = await Promise.all(
        batchInfo.map(async (batch) => {
          const enrolled = await getBatchEnrollmentCount(batch.batch_type);
          return {
            id: batch.batch_type,
            name: batch.name,
            time: batch.time_slot,
            capacity: batch.capacity,
            enrolled: enrolled,
            icon: batch.icon,
            price: batch.price,
            batch_type: batch.batch_type
          };
        })
      );

      console.log('Batches with enrollment:', batchesWithEnrollment);
      setBatches(batchesWithEnrollment);
    };

    fetchBatchesWithEnrollment();
  }, [batchInfo]);

  return {
    batches,
    isLoading,
    error,
    refetch: () => {
      // This will trigger a refetch of the data
      window.location.reload();
    }
  };
};
