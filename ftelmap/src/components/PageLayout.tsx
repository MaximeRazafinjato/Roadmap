import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullHeight?: boolean;
  noPadding?: boolean;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  actions,
  children,
  loading = false,
  error = null,
  maxWidth = 'xl',
  fullHeight = false,
  noPadding = false,
  breadcrumbs,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: fullHeight ? '100vh' : '400px',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth={maxWidth} sx={{ mt: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: fullHeight ? '100%' : 'auto',
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          flex: fullHeight ? 1 : 'initial',
          display: 'flex',
          flexDirection: 'column',
          py: noPadding ? 0 : 2,
          px: noPadding ? 0 : { xs: 2, sm: 2 },
        }}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return crumb.path && !isLast ? (
                <Link
                  key={index}
                  underline="hover"
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {crumb.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            borderLeft: 3,
            borderColor: 'primary.main',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                gutterBottom={!!subtitle}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                }}
              >
                {actions}
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Page Content */}
        <Box
          sx={{
            flex: fullHeight ? 1 : 'initial',
            display: fullHeight ? 'flex' : 'block',
            flexDirection: 'column',
            overflow: fullHeight ? 'auto' : 'visible',
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};
