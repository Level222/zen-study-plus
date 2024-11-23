import type { FC } from 'react';
import type { UserOptions } from '../utils/sync-options';
import { Box, Container, Snackbar, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { withRandomId } from '../utils/helpers';
import { getSyncStorage, setSyncStorage } from '../utils/storage';
import { SyncOptions } from '../utils/sync-options';
import Glossary from './Glossary';
import termSections from './term-sections';
import OptionsForm from './UserOptionsForm';
import './style.css';

const App: FC = () => {
  const [defaultSyncOptions, setDefaultSyncOptions] = useState<SyncOptions>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    getSyncStorage('options').then((unknownStorage) => {
      const syncOptions = SyncOptions.parse(unknownStorage.options);
      setDefaultSyncOptions(syncOptions);
    });
  }, []);

  const handleSubmit = useCallback(async (userOptions: UserOptions) => {
    if (!defaultSyncOptions) {
      return;
    }

    await setSyncStorage({
      options: {
        ...defaultSyncOptions,
        user: userOptions,
      },
    });

    setSnackbarOpen(true);
  }, [defaultSyncOptions]);

  return (
    <Container component="main" sx={{ p: '24px' }}>
      <Box component="section">
        <Typography variant="h1" sx={{ fontSize: '2rem' }}>ZEN Study + オプション</Typography>
        {defaultSyncOptions && (
          <OptionsForm
            defaultValues={defaultSyncOptions.user}
            onSubmit={handleSubmit}
          />
        )}
      </Box>
      <Box component="section" sx={{ mt: '35px' }}>
        <Typography variant="h2" sx={{ fontSize: '1.7rem' }}>用語</Typography>
        <Glossary
          termSections={termSections.map((section) => withRandomId({
            ...section,
            terms: section.terms.map(withRandomId),
          }))}
        />
      </Box>
      <Snackbar
        open={snackbarOpen}
        message="保存されました"
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') {
            setSnackbarOpen(false);
          }
        }}
      />
    </Container>
  );
};

export default App;
