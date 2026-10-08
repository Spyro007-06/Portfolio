import { useEffect, useSyncExternalStore } from 'react';
import { Story } from './story/Story';
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

// phones get the story cards; tablets and desktop keep the scrolling chapters
const PHONE = '(max-width: 767.98px)';
const onPhoneChange = (cb: () => void) => {
  const mq = matchMedia(PHONE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

export default function App() {
  const phone = useSyncExternalStore(onPhoneChange, () => matchMedia(PHONE).matches);

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

  if (phone) return <Story />;

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
