import type { FC } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import GitHubIcon from '@mui/icons-material/GitHub';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Container, CssBaseline, List, ListItem, ListItemButton, ListItemIcon, ThemeProvider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ExternalLink from '../components/ExternalLink';
import theme from '../utils/theme';

const App: FC = () => {
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    setVersion(chrome.runtime.getManifest().version);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" sx={{ width: 350 }}>
        <Box sx={{ my: 2 }}>
          <Typography variant="h1">
            ZEN Study +
            <Typography variant="subtitle1" component="span" sx={{ ml: 2 }}>
              v
              {version}
            </Typography>
          </Typography>
        </Box>
        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => {
              chrome.runtime.openOptionsPage();
            }}
          >
            オプションページを開く
          </Button>
        </Box>
        <List sx={{ my: 2 }}>
          <ListItem disablePadding>
            <ListItemButton component={ExternalLink} href="https://github.com/Level222/zen-study-plus">
              <ListItemIcon><GitHubIcon /></ListItemIcon>
              Webサイト・ソースコード
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={ExternalLink} href="https://github.com/Level222/zen-study-plus/issues">
              <ListItemIcon><BugReportIcon /></ListItemIcon>
              バグ報告・機能リクエスト等
            </ListItemButton>
          </ListItem>
        </List>
      </Container>
    </ThemeProvider>
  );
};

export default App;
