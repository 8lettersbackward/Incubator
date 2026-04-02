import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Smartphone, Thermometer, AlertTriangle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/logo';

export default function LandingPage() {
  const mobileImage = PlaceHolderImages.find(img => img.id === 'mobile-app-interface');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo className="w-28 sm:w-32" />
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up <ArrowRight className="ml-2" /></Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24">
           <div className="flex justify-center mb-8">
             <Logo className="w-48 sm:w-64" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Smart Incubation, Simplified.
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Welcome to Eggcelent, the smart IoT dashboard for monitoring your egg incubator. Keep track of temperature, humidity, and more, all from one place.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started for Free
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </section>

        {/* Feature Section */}
        <section className="bg-card/50 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold">Total Control at Your Fingertips</h3>
                    <p className="text-muted-foreground mt-2">All the essential features for a successful hatch.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card p-6 rounded-lg text-center">
                        <Thermometer className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h4 className="text-xl font-semibold mb-2">Real-time Monitoring</h4>
                        <p className="text-muted-foreground">Live data streams for temperature and humidity ensure optimal conditions.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg text-center">
                        <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h4 className="text-xl font-semibold mb-2">Smart Alerts</h4>
                        <p className="text-muted-foreground">Receive critical and warning alerts if conditions deviate from the ideal range.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg text-center">
                        <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h4 className="text-xl font-semibold mb-2">Mobile Ready</h4>
                        <p className="text-muted-foreground">Install Eggcelent as a PWA on your phone for a native app experience.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* PWA Install Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            {mobileImage && <Image 
              src={mobileImage.imageUrl} 
              alt={mobileImage.description}
              width={600}
              height={500}
              data-ai-hint={mobileImage.imageHint}
              className="rounded-lg shadow-xl"
            />}
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4">Get the Mobile App Experience</h3>
            <p className="text-muted-foreground mb-6">
              For easy access, install the Eggcelent dashboard directly to your phone's home screen. It's fast, works offline, and gives you a native app feel without the app store.
            </p>
            <div className="bg-card p-4 rounded-lg">
                <p className="font-semibold flex items-center gap-2"><Download className="w-5 h-5 text-primary"/> How to Install:</p>
                <ol className="list-decimal list-inside text-left mt-2 text-sm text-muted-foreground space-y-1">
                    <li>Open Eggcelent in your mobile browser (Chrome on Android, Safari on iOS).</li>
                    <li>Tap the 'Share' or 'Settings' icon in your browser.</li>
                    <li>Select 'Add to Home Screen' or 'Install App'.</li>
                    <li>Launch it like any other app!</li>
                </ol>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Eggcelent. All rights reserved.</p>
      </footer>
    </div>
  );
}
