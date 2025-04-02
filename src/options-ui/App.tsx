import type { FC } from 'react';
import type { UserOptions } from '../utils/sync-options';
import { Box, Button, Container, CssBaseline, Snackbar, ThemeProvider, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { defaultSyncOptions } from '../utils/default-options';
import { withRandomId } from '../utils/helpers';
import { getSyncStorage, setSyncStorage } from '../utils/storage';
import { SyncOptions } from '../utils/sync-options';
import theme from '../utils/theme';
import ConfirmationDialog from './ConfirmationDialog';
import Glossary from './Glossary';
import termSections from './term-sections';
import OptionsForm from './UserOptionsForm';

const App: FC = () => {
  const [initialSyncOptions, setInitialSyncOptions] = useState<SyncOptions>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncOptionsLoadingFailed, setSyncOptionsLoadingFailed] = useState<boolean>();

  useEffect(() => {
    getSyncStorage('options')
      .then((unknownStorage) => {
        const syncOptions = SyncOptions.parse(unknownStorage.options);
        setInitialSyncOptions(syncOptions);
        setSyncOptionsLoadingFailed(false);
      })
      .catch(() => {
        setSyncOptionsLoadingFailed(true);
      });
  }, []);

  const handleSubmit = useCallback(async (userOptions: UserOptions) => {
    if (!initialSyncOptions) {
      return;
    }

    await setSyncStorage({
      options: {
        ...initialSyncOptions,
        user: userOptions,
      },
    });

    setSnackbarOpen(true);
  }, [initialSyncOptions]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main">
        <Box component="section" sx={{ my: 3 }}>
          <Typography variant="h1">ZEN Study + オプション</Typography>
          {initialSyncOptions && (
            <OptionsForm
              defaultValues={initialSyncOptions.user}
              onSubmit={handleSubmit}
            />
          )}
          {syncOptionsLoadingFailed && (
            <Box sx={{ my: 2, color: 'error.main' }}>
              オプションの読み込みに失敗しました。リセットすることで解決することもできます。
            </Box>
          )}
          <Box sx={{ my: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              すべてのオプションをリセット
            </Button>
          </Box>
        </Box>
        <Box component="section" sx={{ my: 3 }}>
          <Typography variant="h2">用語</Typography>
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          onClose={(_event, reason) => {
            if (reason !== 'clickaway') {
              setSnackbarOpen(false);
            }
          }}
        />
        <ConfirmationDialog
          open={dialogOpen}
          title="本当にリセットしますか？"
          yes="リセット"
          no="キャンセル"
          onClose={(isConfirmed) => {
            if (isConfirmed) {
              setSyncStorage({ options: defaultSyncOptions });
            }

            setDialogOpen(false);
          }}
        />
      </Container>
    </ThemeProvider>
  );
};

export default App;
