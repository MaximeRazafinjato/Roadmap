using System;

namespace FtelMap.Application.Exceptions
{
    public class AuthenticationException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public AuthenticationException(string message, int statusCode = 401, string errorCode = "AUTH_ERROR")
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }

    public class InvalidCredentialsException : AuthenticationException
    {
        public InvalidCredentialsException()
            : base("E-mail ou mot de passe incorrect", 401, "INVALID_CREDENTIALS")
        {
        }
    }

    public class AccountInactiveException : AuthenticationException
    {
        public AccountInactiveException()
            : base("Ce compte a été désactivé. Veuillez contacter l'administrateur", 403, "ACCOUNT_INACTIVE")
        {
        }
    }

    public class AccountLockedException : AuthenticationException
    {
        public AccountLockedException(int remainingMinutes)
            : base($"Compte temporairement verrouillé suite à plusieurs tentatives échouées. Réessayez dans {remainingMinutes} minutes", 423, "ACCOUNT_LOCKED")
        {
        }
    }

    public class UserAlreadyExistsException : AuthenticationException
    {
        public UserAlreadyExistsException(string field)
            : base($"Un utilisateur avec cette {field} existe déjà", 409, "USER_EXISTS")
        {
        }
    }

    public class InvalidTokenException : AuthenticationException
    {
        public InvalidTokenException()
            : base("Token invalide ou expiré", 401, "INVALID_TOKEN")
        {
        }
    }

    public class EmailNotVerifiedException : AuthenticationException
    {
        public EmailNotVerifiedException()
            : base("Veuillez vérifier votre adresse e-mail avant de vous connecter", 403, "EMAIL_NOT_VERIFIED")
        {
        }
    }
}