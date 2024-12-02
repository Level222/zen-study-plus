import type { FC } from 'react';
import type { WithRandomId } from '../utils/helpers';
import type { Term, TermSection } from './term-sections';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

export type GlossaryProps = {
  termSections: WithRandomId<Omit<TermSection, 'terms'> & {
    terms: WithRandomId<Term>[];
  }>[];
};

const Glossary: FC<GlossaryProps> = ({ termSections }) => {
  return (
    <Box>
      {termSections.map(({ name, terms, randomId: sectionRandomId }) => (
        <Box key={sectionRandomId} component="section" sx={{ my: 2 }}>
          <Typography variant="h3">{name}</Typography>
          <List>
            {terms.map(({ name, description, randomId: termRandomId }) => (
              <ListItem key={termRandomId}>
                <ListItemText primary={name} secondary={description} />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

export default Glossary;
