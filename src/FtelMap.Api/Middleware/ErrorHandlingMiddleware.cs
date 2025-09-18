using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FtelMap.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FtelMap.Api.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ErrorResponse();

            switch (exception)
            {
                case AuthenticationException authEx:
                    context.Response.StatusCode = authEx.StatusCode;
                    response.Message = authEx.Message;
                    response.ErrorCode = authEx.ErrorCode;
                    _logger.LogWarning(authEx, "Authentication error: {ErrorCode}", authEx.ErrorCode);
                    break;

                case ArgumentException argEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = argEx.Message;
                    response.ErrorCode = "INVALID_ARGUMENT";
                    _logger.LogWarning(argEx, "Invalid argument error");
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = "Accès non autorisé";
                    response.ErrorCode = "UNAUTHORIZED";
                    _logger.LogWarning(exception, "Unauthorized access");
                    break;

                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = "Ressource non trouvée";
                    response.ErrorCode = "NOT_FOUND";
                    _logger.LogWarning(exception, "Resource not found");
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Message = "Une erreur inattendue est survenue. Veuillez réessayer plus tard";
                    response.ErrorCode = "INTERNAL_ERROR";
                    _logger.LogError(exception, "Unexpected error occurred");
                    break;
            }

            response.Timestamp = DateTime.UtcNow;
            response.Path = context.Request.Path;

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }

    public class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Path { get; set; } = string.Empty;
    }

    public static class ErrorHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ErrorHandlingMiddleware>();
        }
    }
}