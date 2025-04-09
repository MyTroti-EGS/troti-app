import { useAuthSession } from '../providers/AuthProvider';

interface TripStartResponse {
  message: string;
  scooterId: string;
}

interface TripEndResponse {
  message: string;
  tripId: string;
  scooterId: string;
  tripCost: number;
  paymentUrl: string;
  invoiceId: string;
  paymentId: string;
}

export const startTrip = async (scooterId: string, token: string): Promise<TripStartResponse> => {
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch('https://egs-backend.mxv.pt/v1/trip/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ scooterId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to start trip: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Start trip error:', error);
    throw error;
  }
};

export const endTrip = async (token: string): Promise<TripEndResponse> => {
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch('https://egs-backend.mxv.pt/v1/trip/end', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to end trip: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('End trip error:', error);
    throw error;
  }
}; 