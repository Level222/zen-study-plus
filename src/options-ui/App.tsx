import type { FC } from 'react';
import type { UserOptions } from '../utils/sync-options';
import { Container, Snackbar, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { SyncOptions } from '../utils/sync-options';
import OptionsForm from './UserOptionsForm';
import './style.css';

const App: FC = () => {
  const [defaultSyncOptions, setDefaultSyncOptions] = useState<SyncOptions>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('options').then((unknownStorage) => {
      const syncOptions = SyncOptions.parse(unknownStorage.options);
      setDefaultSyncOptions(syncOptions);
    });
  }, []);

  const handleSubmit = useCallback(async (userOptions: UserOptions) => {
    if (!defaultSyncOptions) {
      return;
    }

    await chrome.storage.sync.set({
      options: {
        ...defaultSyncOptions,
        user: userOptions,
      },
    });

    setSnackbarOpen(true);
  }, [defaultSyncOptions]);

  return (
    <Container component="main" sx={{ p: '24px' }}>
      <Typography variant="h1" sx={{ fontSize: '2rem' }}>ZEN Study + オプション</Typography>
      {defaultSyncOptions && (
        <OptionsForm
          defaultValues={defaultSyncOptions.user}
          onSubmit={handleSubmit}
        />
      )}
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
