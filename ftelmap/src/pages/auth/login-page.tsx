import React, { useState, useEffect } from 'react';
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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const theme = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  // Keep the error visible after it's set
  const [persistentError, setPersistentError] = useState<string | null>(null);

  useEffect(() => {
    if (loginError) {
      setPersistentError(loginError);
    }
  }, [loginError]);

  const from = location.state?.from?.pathname || '/timeline';

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('HandleSubmit called with formData:', formData);

    // Clear previous errors
    setLoginError(null);
    setPersistentError(null);
    setErrors({});

    // Validation côté client
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Adresse e-mail invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Calling login mutation with:', formData);

    try {
      await login.mutateAsync(formData);
      console.log('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.log('Login failed:', error);
      setAttemptCount(prev => prev + 1);

      // Set error message
      const errorMessage = error?.message || 'E-mail ou mot de passe incorrect';
      setLoginError(errorMessage);
      setPersistentError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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
                <form onSubmit={handleSubmit} noValidate>
                  <Stack spacing={3}>
                    {(loginError || persistentError) && (
                      <Fade in={true}>
                        <Alert
                          severity="error"
                          variant="filled"
                          onClose={() => {
                            setLoginError(null);
                            setPersistentError(null);
                          }}
                          sx={{
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                              fontWeight: 500
                            }
                          }}
                        >
                          {loginError || persistentError}
                        </Alert>
                      </Fade>
                    )}

                    {attemptCount >= 3 && (
                      <Fade in={true}>
                        <Alert
                          severity="warning"
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          Après plusieurs tentatives infructueuses, vérifiez que vous utilisez les bons identifiants.
                          Si vous avez oublié votre mot de passe, utilisez le lien "Mot de passe oublié ?" ci-dessous.
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
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color={errors.email ? "error" : "action"} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: errors.email ? 'error.main' : 'primary.main',
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
                      error={!!errors.password}
                      helperText={errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color={errors.password ? "error" : "action"} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="afficher/masquer le mot de passe"
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: errors.password ? 'error.main' : 'primary.main',
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