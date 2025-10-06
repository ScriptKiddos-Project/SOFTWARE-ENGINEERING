// import React from 'react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Icons
import {
  Code, 
  Palette, 
  Music, 
  Heart, 
  Gamepad2, 
  Camera, 
  Users, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

// Router
import { useNavigate } from 'react-router-dom';


const ClubCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'technical',
      name: 'Technical',
      icon: Code,
      count: 12,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-600',
      trending: true,
      description: 'Programming, AI, Web Dev',
    },
    {
      id: 'cultural',
      name: 'Cultural',
      icon: Palette,
      count: 8,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconColor: 'text-purple-600',
      trending: false,
      description: 'Dance, Drama, Literature',
    },
    {
      id: 'music',
      name: 'Music',
      icon: Music,
      count: 5,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconColor: 'text-green-600',
      trending: true,
      description: 'Band, Choir, Classical',
    },
    {
      id: 'social',
      name: 'Social Service',
      icon: Heart,
      count: 7,
      color: 'bg-red-50 text-red-600 border-red-200',
      iconColor: 'text-red-600',
      trending: false,
      description: 'NGO, Community, Volunteer',
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: Gamepad2,
      count: 10,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      iconColor: 'text-orange-600',
      trending: true,
      description: 'Cricket, Football, Chess',
    },
    {
      id: 'photography',
      name: 'Arts & Media',
      icon: Camera,
      count: 6,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      iconColor: 'text-indigo-600',
      trending: false,
      description: 'Photography, Film, Design',
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/clubs?category=${categoryId}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Club Categories</span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/clubs')}
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group relative p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                </div>
                
                {category.trending && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {category.count} clubs
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Can't find what you're looking for?
              </h4>
              <p className="text-sm text-blue-700">
                Suggest a new club category or start your own club
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-600"
            >
              Suggest Club
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubCategories;