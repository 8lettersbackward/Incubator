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
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DashboardContent = () => {
  const { focusedView, setFocusedView } = useView();

  const views: Record<NonNullable<ViewType>, { component: React.ReactNode, title: string }> = {
    incubator: { component: <IncubatorVisualization />, title: 'Incubator Visualization' },
    controls: { component: <ControlPanel />, title: 'Control Panel' },
    water: { component: <WaterManagement />, title: 'Water Management' },
    camera: { component: <CameraConnectivity />, title: 'Camera Feed' },
    system: { component: <SystemControls />, title: 'System Controls' },
    progress: { component: <IncubationProgress />, title: 'Incubation Progress' },
    components: { component: <ComponentsGuide />, title: 'Components Guide' },
  };

  if (focusedView && views[focusedView]) {
    const { component } = views[focusedView];
    return (
      <>
        <div className="mb-4">
          <Button onClick={() => setFocusedView(null)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            {component}
          </div>
        </div>
      </>
    );
  }

  return (
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
  );
};


export default function Home() {
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
