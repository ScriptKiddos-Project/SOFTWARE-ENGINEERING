// // import React from 'react';
// import StatsCards from '../components/dashboard/StatsCards';
// import ClubCategories from '../components/dashboard/ClubCategories';
// import TopEvents from '../components/dashboard/TopEvents';
// import QuickActions from '../components/dashboard/QuickActions';
// import RecentActivity from '../components/dashboard/RecentActivity';
// import { useAuth } from '../hooks/useAuth';

// const Dashboard = () => {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="p-6 max-w-7xl mx-auto space-y-8">
//         {/* Welcome Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
//           <h1 className="text-3xl font-bold mb-2">
//             Welcome back, {user?.firstName}! 👋
//           </h1>
//           <p className="text-blue-100">
//             Ready to explore what's happening on campus today?
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <StatsCards />

//         {/* Main Dashboard Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-8">
//             <ClubCategories />
//             <TopEvents />
//           </div>

//           {/* Right Column */}
//           <div className="space-y-8">
//             <QuickActions />
//             <RecentActivity />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import React from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import ClubCategories from '../components/dashboard/ClubCategories';
import TopEvents from '../components/dashboard/TopEvents';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const [htmlClass, setHtmlClass] = useState(document.documentElement.className);

  const manualToggle = () => {
    document.documentElement.classList.toggle('dark');
    setHtmlClass(document.documentElement.className);
    console.log('Manual toggle clicked!', document.documentElement.className);
    console.log('Current classes:', document.documentElement.classList.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-blue-100">
            Ready to explore what's happening on campus today?
          </p>
        </div>

        {/* 🧪 THEME TEST SECTION - TEMPORARY */}
        <div className="p-4 bg-background text-foreground border-2 border-border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">🧪 Theme Testing (Remove after testing)</h3>
          <p className="text-muted-foreground mb-3">
            This text should change color when dark mode is toggled
          </p>
          <button 
            onClick={manualToggle}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Manual Dark Toggle Test
          </button>
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm font-mono">
              Current HTML class: <strong className="text-primary">{htmlClass || '(none)'}</strong>
            </p>
          </div>
          
          {/* Color test swatches */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-background border border-border rounded">bg-background</div>
            <div className="p-2 bg-card border border-border rounded">bg-card</div>
            <div className="p-2 bg-primary text-primary-foreground rounded">bg-primary</div>
            <div className="p-2 bg-secondary text-secondary-foreground rounded">bg-secondary</div>
            <div className="p-2 bg-muted text-muted-foreground rounded">bg-muted</div>
            <div className="p-2 bg-accent text-accent-foreground rounded">bg-accent</div>
          </div>
        </div>
        {/* END THEME TEST SECTION */}

        {/* Stats Overview */}
        <StatsCards />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ClubCategories />
            <TopEvents />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;