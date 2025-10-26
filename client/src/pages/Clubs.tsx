import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { Club } from '../types/club';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Calendar, TrendingUp, Search } from 'lucide-react';

const Clubs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClubs(page);
  }, [page]);

  const fetchClubs = async (pageNumber: number) => {
    setLoading(true);
    try {
      // Call the service - it now returns ClubListResponse directly
      const response = await clubService.getClubs({ 
        page: pageNumber,
        limit: 20 
      });

      // Now response is { clubs: [], total: 17, page: 1, ... }
      setClubs(response.clubs || []);
      setPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);

    } catch (error) {
      console.error('Failed to fetch clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchClubs(1);
      return;
    }

    setLoading(true);
    try {
      const results = await clubService.searchClubs(searchQuery);
      setClubs(results);
      setTotalPages(1);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      cultural: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      academic: 'bg-yellow-100 text-yellow-800',
      social_service: 'bg-pink-100 text-pink-800',
      entrepreneurship: 'bg-orange-100 text-orange-800',
      arts: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Clubs</h1>
        <p className="text-gray-600">
          Discover and join {total} amazing clubs on campus
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        {searchQuery && (
          <Button variant="outline" onClick={() => { setSearchQuery(''); fetchClubs(1); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Clubs Grid */}
      {clubs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No clubs found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchClubs(1)}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <Card 
                key={club.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/clubs/${club.id}`)}
              >
                {/* Club Logo/Cover */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                  {club.coverImageUrl ? (
                    <img 
                      src={club.coverImageUrl} 
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {club.logoUrl ? (
                        <img 
                          src={club.logoUrl} 
                          alt={club.name}
                          className="w-24 h-24 object-contain"
                        />
                      ) : (
                        <div className="text-white text-4xl font-bold">
                          {club.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                    <Badge className={getCategoryColor(club.category)}>
                      {club.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {club.description || 'No description available'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{club.memberCount || 0} members</span>
                    </div>
                    {club.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 border-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Clubs;