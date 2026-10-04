import type { MouseEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Icon, type IconName } from './Icon';

type Props = {
  href: string;
  children: ReactNode;
  tone?: 'dark' | 'light';
  icon?: IconName;
  external?: boolean;
  download?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

export function Cta({ href, children, tone = 'dark', icon = 'arrow', external, download, onClick }: Props) {
  return (
    <motion.a
      className={`btn btn--${tone}`}
      href={href}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      download={download || undefined}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
    >
      <span>{children}</span>
      <Icon name={icon} />
    </motion.a>
  );
}
