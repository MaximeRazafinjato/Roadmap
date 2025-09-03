# Multi-stage build
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["FtelMap.sln", "./"]
COPY ["src/FtelMap.Api/FtelMap.Api.csproj", "src/FtelMap.Api/"]
COPY ["src/FtelMap.Application/FtelMap.Application.csproj", "src/FtelMap.Application/"]
COPY ["src/FtelMap.Core/FtelMap.Core.csproj", "src/FtelMap.Core/"]
COPY ["src/FtelMap.Infrastructure/FtelMap.Infrastructure.csproj", "src/FtelMap.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/FtelMap.Api/FtelMap.Api.csproj"

# Copy source code
COPY . .

# Build
WORKDIR "/src/src/FtelMap.Api"
RUN dotnet build "FtelMap.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "FtelMap.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FtelMap.Api.dll"]