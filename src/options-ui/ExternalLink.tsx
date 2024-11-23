import type { FC } from 'react';
import { Link, type LinkProps } from '@mui/material';

type ExternalLinkProps = LinkProps & {
  href: string;
};

const ExternalLink: FC<ExternalLinkProps> = ({ children, ...props }) => {
  return (
    <Link target="_blank" rel="noreferrer" {...props}>
      {children ?? props.href}
    </Link>
  );
};

export default ExternalLink;
