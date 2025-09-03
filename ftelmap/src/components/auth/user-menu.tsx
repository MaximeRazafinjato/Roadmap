import { useState, MouseEvent } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useAuth, useLogout } from '../../hooks/use-auth';

export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = () => {
    const firstInitial = user.firstName?.[0]?.toUpperCase() || '';
    const lastInitial = user.lastName?.[0]?.toUpperCase() || '';
    return firstInitial + lastInitial || user.email[0].toUpperCase();
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          px: 1,
          py: 0.5,
          borderRadius: 3,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {getInitials()}
        </Avatar>
        <Box sx={{ ml: 1.5, display: { xs: 'none', md: 'block' } }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <ArrowDownIcon
          sx={{
            ml: 1,
            fontSize: 20,
            color: 'text.secondary',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={handleLogout} disabled={logout.isPending}>
          <ListItemIcon>
            {logout.isPending ? (
              <CircularProgress size={18} />
            ) : (
              <LogoutIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}