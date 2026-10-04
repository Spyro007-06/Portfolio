import { person } from '../content';
import { Icon } from '../components/Icon';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-in">
        <span className="monogram" aria-hidden="true">
          T<span>B</span>
        </span>
        <p>© 2026 {person.name}. Built with code + curiosity.</p>
        <div className="social">
          <a href={person.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Icon name="linkedin" />
          </a>
          <a href={person.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <Icon name="github" />
          </a>
          <a href={`mailto:${person.email}`} aria-label="Email">
            <Icon name="mail" />
          </a>
        </div>
      </div>
    </footer>
  );
}
