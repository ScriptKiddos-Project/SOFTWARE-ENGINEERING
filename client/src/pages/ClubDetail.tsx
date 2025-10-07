import { useEffect, useState } from 'react';
import { ApiService, PaginatedResponse } from '../services/api';
import { Club } from '../types/club';

const ClubsPage = () => {
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClubs(page);
  }, [page]);

  const fetchClubs = async (pageNumber: number) => {
    setLoading(true);
    try {
      // Use getPaginated which handles different response shapes
      const response: PaginatedResponse<Club> = await ApiService.getPaginated(`/clubs`, { page: pageNumber });

      // Safe extraction
      setClubs(response.data || []); 
      setPage(response.pagination.page || 1);
      setTotalPages(response.pagination.totalPages || 1);

    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      setClubs([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {clubs.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No clubs found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <div key={club.id}>{club.name}</div> // replace with your ClubCard component
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
