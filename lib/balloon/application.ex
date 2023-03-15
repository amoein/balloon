defmodule Balloon.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      BalloonWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Balloon.PubSub},
      # Start Finch
      {Finch, name: Balloon.Finch},
      # Start the Endpoint (http/https)
      BalloonWeb.Endpoint
      # Start a worker by calling: Balloon.Worker.start_link(arg)
      # {Balloon.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Balloon.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BalloonWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
