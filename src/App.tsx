import { useEffect } from 'react';
import { ScrollTrigger, startSmoothScroll } from './lib/motion';
import { Nav } from './components/Nav';
import { Rail } from './components/Rail';
import { Hero } from './scenes/Hero';
import { Hall } from './scenes/Hall';
import { Forge } from './scenes/Forge';
import { Pantheon } from './scenes/Pantheon';
import { Ascent } from './scenes/Ascent';
import { Gates } from './scenes/Gates';
import { Footer } from './scenes/Footer';

export default function App() {
  useEffect(() => {
    const stop = startSmoothScroll();
    // measurements depend on fonts and painted images, so re-measure once they have arrived
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      stop();
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>
      <Nav />
      <Rail />
      <main>
        <Hero />
        <Hall />
        <Forge />
        <Pantheon />
        <Ascent />
        <Gates />
      </main>
      <Footer />
    </>
  );
}
