import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Login as LoginIcon,
} from '@mui/icons-material';
import { useLogin } from '../../hooks/use-auth';
import type { LoginRequest } from '../../types/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login.mutateAsync(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
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
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  FtelMap
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Bon retour
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
                    {login.error && (
                      <Fade in={true}>
                        <Alert severity="error" variant="outlined">
                          {login.error instanceof Error 
                            ? login.error.message 
                            : 'Échec de la connexion. Veuillez vérifier vos identifiants.'}
                        </Alert>
                      </Fade>
                    )}

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
                      disabled={login.isPending}
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
                      placeholder="Entrez votre mot de passe"
                      fullWidth
                      required
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={login.isPending}
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

                    <Box sx={{ textAlign: 'right' }}>
                      <Link
                        to="/forgot-password"
                        style={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Mot de passe oublié ?
                        </Typography>
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={login.isPending}
                      startIcon={
                        login.isPending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <LoginIcon />
                        )
                      }
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: login.isPending 
                          ? undefined 
                          : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': {
                          background: login.isPending
                            ? undefined
                            : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {login.isPending ? 'Connexion...' : 'Se connecter'}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        OU
                      </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Pas de compte ?{' '}
                        <Link
                          to="/register"
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
                            Créer un compte
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
                Protégé par une sécurité de niveau entreprise
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}