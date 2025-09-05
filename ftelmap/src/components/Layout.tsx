import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { UserMenu } from './auth/user-menu';
import { useAuth } from '../contexts/auth-context';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Projets',
    path: '/projects',
    icon: <FolderIcon />,
  },
  {
    title: 'Utilisateurs',
    path: '/users',
    icon: <PeopleIcon />,
    adminOnly: true,
  },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && user?.role !== 'Admin') {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 3 }}>
      <Box sx={{ px: 3, pb: 3 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          FtelMap
        </Typography>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: 2, pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main' + '15',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main' + '25',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          bgcolor: 'white',
          color: 'text.primary',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3, md: 4 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 0,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mr: isMobile ? 'auto' : 4,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            FtelMap
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                    backgroundColor: isActive(item.path) ? 'primary.main' + '15' : 'transparent',
                    fontWeight: isActive(item.path) ? 600 : 400,
                    '&:hover': {
                      backgroundColor: isActive(item.path) 
                        ? 'primary.main' + '25'
                        : 'action.hover',
                    },
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Stack>
          )}

          <UserMenu />
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // Exact height of the toolbar
          px: { xs: 2, sm: 3, md: 4 },
          height: '100vh',
          bgcolor: '#f8fafc',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container maxWidth="xl" sx={{ 
          height: 'calc(100vh - 64px)', 
          pt: 3, 
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;