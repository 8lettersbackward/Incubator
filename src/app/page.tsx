'use client';

import Header from '@/components/layout/header';
import IncubatorVisualization from '@/components/incubator/incubator-visualization';
import ControlPanel from '@/components/incubator/control-panel';
import WaterManagement from '@/components/incubator/water-management';
import CameraConnectivity from '@/components/incubator/camera-connectivity';
import ComponentsGuide from '@/components/incubator/components-guide';
import SystemControls from '@/components/incubator/system-controls';
import IncubationProgress from '@/components/incubator/incubation-progress';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <IncubatorVisualization />
          </div>
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <WaterManagement />
            <CameraConnectivity />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <SystemControls />
            <IncubationProgress />
          </div>
          <div className="lg:col-span-4">
            <ComponentsGuide />
          </div>
        </div>
      </main>
    </div>
  );
}
