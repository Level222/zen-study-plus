import type { LinkProps } from '@mui/material';
import type { FC } from 'react';
import { Link } from '@mui/material';

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
