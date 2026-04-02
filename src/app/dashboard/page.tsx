'use client';

import Header from '@/components/layout/header';
import IncubatorVisualization from '@/components/incubator/incubator-visualization';
import ControlPanel from '@/components/incubator/control-panel';
import WaterManagement from '@/components/incubator/water-management';
import CameraConnectivity from '@/components/incubator/camera-connectivity';
import ComponentsGuide from '@/components/incubator/components-guide';
import SystemControls from '@/components/incubator/system-controls';
import IncubationProgress from '@/components/incubator/incubation-progress';
import { ViewProvider, useView, ViewType } from '@/contexts/view-context';

const DashboardContent = () => {
  const { focusedView } = useView();

  const views: Record<Exclude<ViewType, null | 'incubator'>, React.ReactNode> = {
    controls: <ControlPanel />,
    water: <WaterManagement />,
    camera: <CameraConnectivity />,
    system: <SystemControls />,
    progress: <IncubationProgress />,
    components: <ComponentsGuide />,
  };
  
  // Default to 'controls' on initial load (when focusedView is null) or if 'incubator' is selected
  const currentView = (!focusedView || focusedView === 'incubator') ? 'controls' : focusedView;

  const RightPanelComponent = views[currentView];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <IncubatorVisualization />
      </div>
      <div className="lg:col-span-1">
        {RightPanelComponent}
      </div>
    </div>
  );
};


export default function DashboardPage() {
  return (
    <ViewProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <Header />
          <DashboardContent />
        </main>
      </div>
    </ViewProvider>
  );
}
