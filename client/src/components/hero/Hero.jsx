import { useSettings } from '../../context/SettingsContext';
import HeroSlideshow from './HeroSlideshow';

const Hero = () => {
  const { settings } = useSettings();
  
  const heroSlides = settings?.hero?.slides || [];
  const heroSettings = {
    autoPlay: settings?.hero?.autoPlay ?? true,
    autoPlaySpeed: settings?.hero?.autoPlaySpeed ?? 5000,
    showDots: settings?.hero?.showDots ?? true,
    showArrows: settings?.hero?.showArrows ?? true
  };
  
  return <HeroSlideshow slides={heroSlides} settings={heroSettings} />;
};

export default Hero;