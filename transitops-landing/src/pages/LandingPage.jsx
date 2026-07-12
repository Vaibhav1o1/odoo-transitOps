import Navbar from '../components/Navbar/Navbar.jsx';
import Hero from '../components/Hero/Hero.jsx';
import Statistics from '../components/Statistics/Statistics.jsx';
import Features from '../components/Features/Features.jsx';
import DashboardPreview from '../components/Dashboard/DashboardPreview.jsx';
import CTA from '../components/CTA/CTA.jsx';
import Footer from '../components/Footer/Footer.jsx';

export default function LandingPage() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <Features />
        <DashboardPreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
