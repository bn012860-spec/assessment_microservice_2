FROM mcr.microsoft.com/dotnet/sdk:8.0

# Create a user 'judge' with a home directory
RUN addgroup --system judge && adduser --system --ingroup judge --home /home/judge judge
RUN mkdir -p /home/judge && chown -R judge:judge /home/judge

# Pre-create a dotnet project to warm up the cache
WORKDIR /home/judge/app
RUN dotnet new console
RUN dotnet build

ENV HOME=/home/judge
ENV DOTNET_CLI_HOME=/tmp
ENV DOTNET_NOLOGO=true
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true

USER judge
WORKDIR /app
