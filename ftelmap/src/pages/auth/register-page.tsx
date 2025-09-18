import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Container,
  Fade,
  Grow,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useRegister } from '../../hooks/use-auth';
import type { RegisterRequest } from '../../types/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const navigate = useNavigate();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register.mutateAsync(formData);
      navigate('/timeline', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.secondary.light}20 0%, ${theme.palette.primary.light}20 100%)`,
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={1000}>
          <Box>
            <Grow in={true} timeout={800}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  FtelMap
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Créez votre compte
                </Typography>
              </Box>
            </Grow>

            <Card
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'visible',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {register.error && (
                      <Fade in={true}>
                        <Alert severity="error" variant="outlined">
                          {register.error instanceof Error
                            ? register.error.message
                            : 'Inscription échouée. Veuillez réessayer.'}
                        </Alert>
                      </Fade>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        id="firstName"
                        name="firstName"
                        type="text"
                        label="Prénom"
                        placeholder="Entrez votre prénom"
                        fullWidth
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={register.isPending}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                      <TextField
                        id="lastName"
                        name="lastName"
                        type="text"
                        label="Nom"
                        placeholder="Entrez votre nom"
                        fullWidth
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={register.isPending}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      id="username"
                      name="username"
                      type="text"
                      label="Nom d'utilisateur"
                      placeholder="Choisissez un nom d'utilisateur"
                      fullWidth
                      required
                      value={formData.username}
                      onChange={handleChange}
                      disabled={register.isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />

                    <TextField
                      id="email"
                      name="email"
                      type="email"
                      label="Adresse E-mail"
                      placeholder="Entrez votre e-mail"
                      fullWidth
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={register.isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />

                    <TextField
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Mot de passe"
                      placeholder="Créez un mot de passe fort"
                      fullWidth
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={register.isPending}
                      helperText="Utilisez au moins 8 caractères avec un mélange de lettres, chiffres et symboles"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="afficher/masquer le mot de passe"
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={register.isPending}
                      startIcon={
                        register.isPending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PersonAddIcon />
                        )
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: register.isPending
                          ? undefined
                          : `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                        '&:hover': {
                          background: register.isPending
                            ? undefined
                            : `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {register.isPending ? 'Création du compte...' : 'Créer un compte'}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        OU
                      </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Déjà un compte ?{' '}
                        <Link
                          to="/login"
                          style={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              fontWeight: 600,
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            Se connecter
                          </Typography>
                        </Link>
                      </Typography>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de
                confidentialité
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
